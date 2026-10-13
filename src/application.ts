import type http from 'node:http';
import { performance } from 'node:perf_hooks';
import type {
  Context,
  GraphQLExtensions,
  ApplicationFactory,
  HTTPListener,
  CoreStats,
  GraphqlResponse,
  LimitsUsage,
  RequestDiagnostics,
} from '@via-profit-services/core';
import {
  validateSchema,
  execute,
  specifiedRules,
  parse,
  Source,
  getOperationAST,
  validate,
  GraphQLError,
  NoSchemaIntrospectionCustomRule,
  Lexer,
  TokenKind,
  type ValidationRule,
  type DocumentNode,
  type ExecutionResult,
} from 'graphql';

import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import applyMiddlewares from './utils/apply-middlewares';
import formatErrors, { formatExecutionErrors } from './utils/format-errors';
import ServerError from './server-error';
import { buildRequestRules, type RuleMeasurements } from './utils/build-validation-rules';
import { buildConfig } from './utils/build-config';
import parseContentType from './utils/content-type-parser';
import { UPLOAD_CLEANUP } from './utils/graphql-file-uploader';
import { CSRF_PREVENTION_HEADERS } from './constants';
import { LRUCache } from './utils/lru-cache';
import { HttpError, isValidHttpStatus } from './utils/http-error';
import { getBodyStats, type BodyStats } from './utils/body-stats';
import { registerRequest, resolveRequestId } from './utils/request-extensions';
import {
  DEFAULT_JSON_MAX_BYTES,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_TOTAL_SIZE,
} from './constants';

/**
 * Cache of parsed and validated documents (see the comment in the listener).
 * Bounded by the number of documents and by the total length of their source
 * text: an AST takes roughly 10-20 times more memory than its source.
 */
const DOCUMENT_CACHE_MAX_ENTRIES = 1000;
const DOCUMENT_CACHE_MAX_TOTAL_LENGTH = 2 * 1024 * 1024;

type CachedDocument = {
  readonly document: DocumentNode;
  readonly errors: readonly GraphQLError[];
  /** Number of tokens, counted only when the usage of the limits is measured */
  readonly tokens?: number;
};

/**
 * Number of tokens of a document, as the parser counts them for maxTokens.
 * One more pass of the lexer: done only on a cache miss and only when the
 * usage is measured.
 */
const countTokens = (source: Source): number => {
  const lexer = new Lexer(source);
  let count = 0;
  while (lexer.advance().kind !== TokenKind.EOF) {
    count += 1;
  }

  return count;
};

const round = (ms: number) => Math.round(ms * 100) / 100;

/**
 * Wraps an error of request parsing into a ServerError: such errors are
 * produced by the core, they are safe to show and must not be masked.
 */
const asRequestError = (error: unknown): never => {
  if (error instanceof ServerError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const graphqlError = new GraphQLError(message, {
    originalError: error instanceof Error ? error : undefined,
  });

  throw new ServerError(
    [graphqlError],
    'graphql-error-validate-request',
    error instanceof HttpError ? error.status : 400,
  );
};

/**
 * Well-known error codes and their HTTP status codes
 */
const STATUS_BY_ERROR_CODE: Record<string, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  BAD_USER_INPUT: 400,
};

/**
 * HTTP status code for an error that stopped the request before or instead
 * of execution.
 */
const statusOfError = (error: unknown): number => {
  if (error instanceof ServerError) {
    return error.httpStatus;
  }

  if (error instanceof GraphQLError) {
    // thrown on purpose (e.g. by a middleware): it may set its own status
    const http = error.extensions?.http as { status?: unknown } | undefined;
    if (isValidHttpStatus(http?.status)) {
      return http.status;
    }

    const code = error.extensions?.code;

    // hasOwnProperty, not `in`: 'toString' in {} is true
    return typeof code === 'string' &&
      Object.prototype.hasOwnProperty.call(STATUS_BY_ERROR_CODE, code)
      ? STATUS_BY_ERROR_CODE[code]
      : 400;
  }

  if (error instanceof HttpError) {
    return error.status;
  }

  // anything else is unexpected: a bug or a failure of an external service
  return 500;
};

/**
 * State of a single request shared by the error boundary (httpListener)
 * and the processing steps (processRequest).
 */
type RequestState = {
  readonly context: Context;
  readonly requestId: string;
  /** Number of this request since the start (stats.requestCounter is shared) */
  readonly requestNumber: number;
  /** Fields added by the project: middleware `extensions` and `setExtension` */
  readonly extensions: Record<string, unknown>;
  readonly validationRule: ValidationRule[];
  /** Removes temporary upload files (see graphql-file-uploader) */
  uploadCleanup?: () => void;

  // Measurements, filled while the request goes through the steps
  readonly measurements: RuleMeasurements;
  readonly timing: { -readonly [K in keyof RequestDiagnostics['timing']]: number };
  bodyStats?: BodyStats;
  tokens?: number;
  documentParsed: boolean;
  operationName: string | null;
  persisted: boolean;
  documentCache: 'hit' | 'miss';
};

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
  const documentCache = new LRUCache<string, CachedDocument>(
    DOCUMENT_CACHE_MAX_ENTRIES,
    DOCUMENT_CACHE_MAX_TOTAL_LENGTH,
  );

  /**
   * Legacy mode only (`sharedContext: true`).
   * One object is shared by ALL requests, including concurrent ones:
   * whatever a middleware writes here is visible to every other request.
   */
  const legacySharedContext: Context = {};

  /**
   * HTTP-level checks: method, Content-Type, CSRF.
   * Throws a ServerError if the request must not be processed.
   */
  const assertRequestAllowed = (request: http.IncomingMessage) => {
    const method = request.method || '';
    const rawContentType = String(request.headers['content-type'] || 'application/json');
    const contentType = parseContentType(rawContentType);

    if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
      throw new ServerError(
        [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests')],
        'graphql-error-execute',
        405,
      );
    }

    if (contentType?.type !== 'application/json' && contentType?.type !== 'multipart/form-data') {
      throw new ServerError(
        [
          new GraphQLError(
            `Expected content-type: application/json or multipart/form-data. Got «${rawContentType}»`,
          ),
        ],
        'graphql-error-validate-request',
        415,
      );
    }

    // GET and multipart requests are sent by browsers without a CORS
    // preflight, so they must carry a header a foreign page cannot set
    if (
      csrfPrevention &&
      (method === 'GET' || contentType.type === 'multipart/form-data') &&
      !CSRF_PREVENTION_HEADERS.some(header => Boolean(request.headers[header]))
    ) {
      throw new ServerError(
        [
          new GraphQLError(
            `This request requires a non-empty «${CSRF_PREVENTION_HEADERS.join('» or «')}» header (CSRF prevention)`,
          ),
        ],
        'graphql-error-validate-request',
      );
    }
  };

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
   * Parsed document validated with the standard rules.
   *
   * Clients send the same query texts again and again, and the result of
   * parse() + validate() with request-independent rules depends only on the
   * text, so it is cached.
   */
  const getDocument = (query: string, state: RequestState): DocumentNode => {
    let cached = documentCache.get(query);
    state.documentCache = cached ? 'hit' : 'miss';

    if (!cached) {
      const source = new Source(query, 'GraphQL request');
      let document: DocumentNode;
      try {
        // maxTokens stops the parser early on huge documents
        document = parse(source, { maxTokens: limits?.maxGraphQLTokens });
      } catch (err) {
        throw new ServerError(
          [err instanceof GraphQLError ? err : new GraphQLError(String(err))],
          'graphql-error-validate-request',
        );
      }

      cached = {
        document,
        errors: validate(schema, document, staticRules),
        tokens: measureUsage ? countTokens(source) : undefined,
      };
      documentCache.set(query, cached, query.length);
    }

    state.documentParsed = true;
    state.tokens = cached.tokens;

    if (cached.errors.length > 0) {
      throw new ServerError(cached.errors, 'graphql-error-validate-field');
    }

    return cached.document;
  };

  /**
   * Usage of the limits by the request: only the values that were measured
   */
  const buildUsage = (state: RequestState): LimitsUsage => {
    const { bodyStats, measurements } = state;
    const complexityLimit = limits?.complexityLimit;
    const usage: Record<string, unknown> = { operationName: state.operationName };
    const add = (name: keyof LimitsUsage, value: number | undefined, max: number | undefined) => {
      if (typeof value === 'number') {
        usage[name] = { value, max: max || null };
      }
    };

    add('bodySize', bodyStats?.bodySize, limits?.maxJSONBodySize || DEFAULT_JSON_MAX_BYTES);
    add('files', bodyStats?.files, limits?.maxFiles ?? DEFAULT_MAX_FILES);
    add(
      'filesTotalSize',
      bodyStats?.filesTotalSize,
      limits?.maxFilesTotalSize ?? DEFAULT_MAX_FILE_TOTAL_SIZE,
    );
    add('tokens', state.tokens, limits?.maxGraphQLTokens);
    add('depth', measurements.depth, limits?.maxGraphQLDepthLimit);
    add('complexity', measurements.complexity, complexityLimit?.maxComplexity);
    add(
      'width',
      measurements.width,
      complexityLimit?.maxComplexity ? complexityLimit.maxFieldsPerSelection : undefined,
    );

    return usage as unknown as LimitsUsage;
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
    assertRequestAllowed(request);

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
      const usage = measureUsage && state.documentParsed ? buildUsage(state) : undefined;

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
