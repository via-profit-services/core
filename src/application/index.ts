import type http from 'node:http';
import { performance } from 'node:perf_hooks';
import {
  validateSchema,
  execute,
  specifiedRules,
  getOperationAST,
  validate,
  GraphQLError,
  NoSchemaIntrospectionCustomRule,
  type ValidationRule,
  type DocumentNode,
  type ExecutionResult,
} from 'graphql';

import bodyParser, { parseGraphQLParams } from '../http/body-parser';
import assertRequestAllowed from '../http/assert-request-allowed';
import { getBodyStats } from '../http/body-stats';
import composeMiddlewares from '../middleware/compose-middlewares';
import applyMiddlewares from '../middleware/apply-middlewares';
import formatErrors, { formatExecutionErrors } from '../errors/format-errors';
import ServerError from '../errors/server-error';
import { buildRequestRules } from '../validation/build-validation-rules';
import { UPLOAD_CLEANUP } from '../uploads/graphql-file-uploader';
import { registerRequest, resolveRequestId } from '../extensions/request-extensions';
import { buildConfig } from './build-config';
import { DocumentCache } from './document-cache';
import { buildLimitsUsage } from './limits-usage';
import { asRequestError, statusOfError } from './request-errors';
import type { RequestState } from './request-state';
import type {
  Context,
  GraphQLExtensions,
  ApplicationFactory,
  HTTPListener,
  CoreStats,
  GraphqlResponse,
  RequestDiagnostics,
} from './types';

const round = (ms: number) => Math.round(ms * 100) / 100;

const applicationFactory: ApplicationFactory = props => {
  const config = buildConfig(props);
  const {
    middleware,
    schema,
    rootValue,
    debug,
    sharedContext,
    maskErrors,
    onError,
    csrfPrevention,
    persistedQueriesOnly,
    introspection,
    limits,
  } = config;
  const stats: CoreStats = { requestCounter: 0, startupTime: new Date() };
  const securityRules: ValidationRule[] = introspection ? [] : [NoSchemaIntrospectionCustomRule];
  const staticRules = [...specifiedRules, ...securityRules];
  // Measuring costs a little (one more lexer pass on a cache miss, rules with
  // callbacks), so it is done only when somebody uses the values
  const measureUsage = Boolean(debug || limits?.exposeUsage || limits?.onUsage);
  const documentCache = new DocumentCache({
    schema,
    rules: staticRules,
    maxTokens: limits?.maxGraphQLTokens,
    countTokens: measureUsage,
  });

  /**
   * Legacy mode only (`sharedContext: true`).
   * One object is shared by ALL requests, including concurrent ones:
   * whatever a middleware writes here is visible to every other request.
   */
  const legacySharedContext: Context = {};

  /**
   * GraphQL parameters of the request. Errors of malformed parameters
   * become request errors.
   */
  const extractParams = (
    body: Awaited<ReturnType<typeof bodyParser>>,
    request: http.IncomingMessage,
  ) => {
    try {
      return parseGraphQLParams({ body, request, config });
    } catch (err) {
      return asRequestError(err);
    }
  };

  /**
   * Parsed document validated with the standard rules (cached, see
   * DocumentCache)
   */
  const getDocument = (query: string, state: RequestState): DocumentNode => {
    const { entry, hit } = documentCache.load(query);
    state.documentCache = hit ? 'hit' : 'miss';
    state.documentParsed = true;
    state.tokens = entry.tokens;

    if (entry.errors.length > 0) {
      throw new ServerError(entry.errors, 'graphql-error-validate-field');
    }

    return entry.document;
  };

  /**
   * Runs a step and adds its duration to the timing of the request
   */
  const timed = <T>(
    state: RequestState,
    step: keyof RequestState['timing'],
    fn: () => T | Promise<T>,
  ): T | Promise<T> => {
    // The timing is shown only in debug mode: no extra work otherwise
    if (!debug) {
      return fn();
    }

    const start = performance.now();
    const done = () => {
      state.timing[step] = round((state.timing[step] ?? 0) + performance.now() - start);
    };

    return Promise.resolve()
      .then(fn)
      .finally(done);
  };

  /**
   * All processing steps of a request, in order.
   *
   * Only the "happy path": any problem is thrown to the caller as an
   * exception. Formatting errors, choosing the HTTP status and cleanup are
   * the job of the error boundary (httpListener), so they are done in one
   * place for errors of every step, including errors thrown by middlewares,
   * the body parser and graphql-js.
   */
  const processRequest = async (
    request: http.IncomingMessage,
    response: http.ServerResponse,
    state: RequestState,
  ): Promise<ExecutionResult> => {
    const { context, extensions, validationRule } = state;

    // 1. Method, Content-Type, CSRF
    assertRequestAllowed(request, csrfPrevention);

    // 2. Run middleware chain
    await timed(state, 'middlewares', () =>
      applyMiddlewares({
        request,
        middlewares: composeMiddlewares(middleware || []),
        config,
        context,
        schema,
        stats,
        extensions,
        validationRule,
      }),
    );

    // 3. Validate schema (graphql-js caches the result in the schema)
    const schemaErrors = validateSchema(schema);
    if (schemaErrors.length > 0) {
      throw new ServerError(schemaErrors, 'graphql-error-validate-schema');
    }

    // 4. Parse request body (JSON or multipart)
    const body = await timed(state, 'body', () =>
      bodyParser({ request, response, config }).catch(asRequestError),
    );
    state.uploadCleanup = (body as Record<symbol, (() => void) | undefined>)[UPLOAD_CLEANUP];
    state.bodyStats = getBodyStats(body);

    // 5. Extract GraphQL params
    const { query, operationName, variables, persisted } = extractParams(body, request);
    state.operationName = typeof operationName === 'string' ? operationName : null;
    state.persisted = Boolean(persisted);

    if (persistedQueriesOnly && !persisted) {
      throw new ServerError(
        [new GraphQLError('Only persisted queries are allowed')],
        'graphql-error-validate-request',
      );
    }

    if (!query || typeof query !== 'string') {
      throw new ServerError(
        [
          new GraphQLError(
            `Failed to parse GraphQL query. The request is empty. Got «${String(query)}»`,
          ),
        ],
        'graphql-error-validate-request',
      );
    }

    // 6. Parse and validate with the standard rules (cached)
    const documentAST = await timed(state, 'document', () => getDocument(query, state));

    // 7. Validate with request-dependent rules: depth, complexity (uses the
    // variables) and rules added by middlewares. They are linear and cheap.
    const requestRules = buildRequestRules(
      config,
      variables,
      measureUsage ? state.measurements : undefined,
    );
    const validationErrors = await timed(state, 'validation', () =>
      validate(schema, documentAST, [...requestRules, ...validationRule]),
    );
    if (validationErrors.length > 0) {
      throw new ServerError(validationErrors, 'graphql-error-validate-field');
    }

    // 8. GET must not execute mutations/subscriptions
    if (request.method === 'GET') {
      const operationAST = getOperationAST(documentAST, operationName);
      if (operationAST && operationAST.operation !== 'query') {
        throw new ServerError(
          [
            new GraphQLError(
              `Can only perform a ${operationAST.operation} operation from a POST request`,
            ),
          ],
          'graphql-error-execute',
        );
      }
    }

    // 9. Execute GraphQL
    const result = await timed(state, 'execution', () =>
      execute({
        variableValues: variables,
        document: documentAST,
        contextValue: context,
        schema,
        rootValue,
        operationName,
      }),
    );

    // 9.1 No data means execution did not start: a GraphQL request error,
    // e.g. a variable value rejected by a scalar or an unknown operationName.
    // It is caused by the client, so it is reported (and never masked) as a
    // request error, not as an execution error.
    if (!('data' in result) && result.errors?.length) {
      throw new ServerError(result.errors, 'graphql-error-validate-request');
    }

    return result;
  };

  /**
   * The error boundary of a request: runs processRequest and turns its
   * outcome - a result or an exception from any step - into a response.
   */
  const httpListener: HTTPListener = async (request, response) => {
    const startTime = performance.now();
    stats.requestCounter += 1;

    // Every request gets its own state. Requests are processed concurrently
    // (every `await` lets another request run), so a shared mutable object
    // would mix data of different users.
    const state: RequestState = {
      context: sharedContext ? legacySharedContext : {},
      requestId: resolveRequestId(request),
      requestNumber: stats.requestCounter,
      extensions: {},
      // Rules pushed by middlewares live only during this request
      validationRule: [],
      measurements: {},
      timing: {},
      documentParsed: false,
      operationName: null,
      persisted: false,
      documentCache: 'miss',
    };

    // setExtension() and getRequestId() find the request by its context.
    // The shared legacy context belongs to every request at once: not registered.
    if (!sharedContext) {
      registerRequest(state.context, { requestId: state.requestId, extensions: state.extensions });
    }

    const buildExtensions = (): GraphQLExtensions => {
      const usage = measureUsage && state.documentParsed ? buildLimitsUsage(state, limits) : undefined;

      if (usage && limits?.onUsage) {
        try {
          limits.onUsage(usage, state.context);
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }

      // The fields of the project first: the core fields can not be replaced
      const extensions: Record<string, unknown> = { ...state.extensions, requestId: state.requestId };

      if (usage && (debug || limits?.exposeUsage)) {
        extensions.limits = usage;
      }

      // Internals of the server: only in debug mode
      if (debug) {
        const diagnostics: RequestDiagnostics = {
          operationName: state.operationName,
          persisted: state.persisted,
          documentCache: state.documentCache,
          timing: state.timing,
        };
        extensions.queryTime = round(performance.now() - startTime);
        extensions.requestCounter = state.requestNumber;
        extensions.startupTime = stats.startupTime;
        extensions.diagnostics = diagnostics;
      }

      return extensions as GraphQLExtensions;
    };

    const finish = (payload: GraphqlResponse, status: number): GraphqlResponse => {
      const graphqlResponse: GraphqlResponse = { ...payload, extensions: buildExtensions() };

      // Non-enumerable: JSON.stringify(response) and { ...response } do not
      // see it, so existing code keeps sending exactly data/errors/extensions
      Object.defineProperty(graphqlResponse, 'status', { value: status, enumerable: false });

      return graphqlResponse;
    };

    try {
      const result = await processRequest(request, response, state);

      // The operation was executed: 200 even with errors (partial success).
      // 4xx/5xx would make proxies and clients treat useful data as a failure.
      return finish(
        {
          data: result.data,
          errors: formatExecutionErrors(result.errors, { debug, maskErrors, onError }),
        },
        200,
      );
    } catch (error) {
      return finish(
        {
          errors: formatErrors({
            error,
            debug,
            maskErrors,
            onError,
            context: state.context,
          }),
        },
        statusOfError(error),
      );
    } finally {
      state.uploadCleanup?.();
    }
  };

  return httpListener;
};

export default applicationFactory;
