import { performance } from 'node:perf_hooks';
import type {
  Context,
  GraphQLExtensions,
  ApplicationFactory,
  HTTPListener,
  CoreStats,
  GraphqlResponse,
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
  type ValidationRule,
  type DocumentNode,
} from 'graphql';

import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import applyMiddlewares from './utils/apply-middlewares';
import formatErrors, { formatExecutionErrors } from './utils/format-errors';
import ServerError from './server-error';
import { buildValidationRules, buildComplexityRule } from './utils/build-validation-rules';
import { buildConfig } from './utils/build-config';
import parseContentType from './utils/content-type-parser';
import { UPLOAD_CLEANUP } from './utils/graphql-file-uploader';
import { CSRF_PREVENTION_HEADERS } from './constants';
import { LRUCache } from './utils/lru-cache';

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
};

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

  throw new ServerError([graphqlError], 'graphql-error-validate-request');
};

const applicationFactory: ApplicationFactory = props => {
  const config = buildConfig(props);
  const baseValidationRules = buildValidationRules(config);
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

  const httpListener: HTTPListener = async (request, response) => {
    const startTime = performance.now();
    stats.requestCounter += 1;

    // Every request gets its own state. Requests are processed concurrently
    // (every `await` lets another request run), so a shared mutable object
    // would mix data of different users.
    const context: Context = sharedContext ? legacySharedContext : {};
    const extensions: GraphQLExtensions = {
      queryTime: 0,
      requestCounter: stats.requestCounter,
      startupTime: stats.startupTime,
    };
    // A copy: rules pushed by a middleware live only during this request
    const validationRule = [...baseValidationRules];

    // Server statistics are internal information: only in debug mode
    const finish = (payload: GraphqlResponse): GraphqlResponse => ({
      ...payload,
      extensions: debug
        ? {
            ...extensions,
            ...stats,
            queryTime: performance.now() - startTime,
          }
        : undefined,
    });

    // Removes temporary upload files when there is no http.ServerResponse
    // to wait for (see graphql-file-uploader)
    let uploadCleanup: (() => void) | undefined;

    try {
      const method = request.method || '';
      const rawContentType = String(request.headers['content-type'] || 'application/json');
      const contentType = parseContentType(rawContentType);

      // 1. Validate HTTP method
      if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
        throw new ServerError(
          [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests')],
          'graphql-error-execute',
        );
      }

      // 1.1 validate content-type
      if (contentType?.type !== 'application/json' && contentType?.type !== 'multipart/form-data') {
        throw new ServerError(
          [
            new GraphQLError(
              `Expected content-type: application/json or multipart/form-data. Got «${rawContentType}»`,
            ),
          ],
          'graphql-error-validate-request',
        );
      }

      // 1.2 CSRF: GET and multipart requests are sent by browsers without a
      // CORS preflight, so they must carry a header a foreign page cannot set
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

      // 2. Run middleware chain
      await applyMiddlewares({
        request,
        middlewares: composeMiddlewares(middleware || []),
        config,
        context,
        schema,
        stats,
        extensions,
        validationRule,
      });

      // 3. Validate schema (graphql-js caches the result in the schema)
      const schemaErrors = validateSchema(schema);
      if (schemaErrors.length > 0) {
        throw new ServerError(schemaErrors, 'graphql-error-validate-schema');
      }

      // 4. Parse request body (JSON or multipart)
      const body = await bodyParser({ request, response, config }).catch(asRequestError);
      uploadCleanup = (body as Record<symbol, (() => void) | undefined>)[UPLOAD_CLEANUP];

      // 5. Extract GraphQL params
      let params: ReturnType<typeof parseGraphQLParams>;
      try {
        params = parseGraphQLParams({ body, request, config });
      } catch (err) {
        return asRequestError(err);
      }
      const { query, operationName, variables, persisted } = params;

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

      // 6. Parse and validate with the standard rules.
      // Clients send the same query texts again and again, and the result of
      // parse() + validate() with request-independent rules depends only on
      // the text, so it is cached.
      let cached = documentCache.get(query);
      if (!cached) {
        let document: DocumentNode;
        try {
          // maxTokens stops the parser early on huge documents
          document = parse(new Source(query, 'GraphQL request'), {
            maxTokens: limits?.maxGraphQLTokens,
          });
        } catch (err) {
          throw new ServerError(
            [err instanceof GraphQLError ? err : new GraphQLError(String(err))],
            'graphql-error-validate-request',
          );
        }

        cached = { document, errors: validate(schema, document, staticRules) };
        documentCache.set(query, cached, query.length);
      }

      if (cached.errors.length > 0) {
        throw new ServerError(cached.errors, 'graphql-error-validate-field');
      }

      const documentAST = cached.document;

      // 7. Validate with request-dependent rules: depth, complexity (uses the
      // variables) and rules added by middlewares. They are linear and cheap.
      const complexityRule = buildComplexityRule(config, variables);
      const validationErrors = validate(schema, documentAST, [
        ...validationRule,
        ...(complexityRule ? [complexityRule] : []),
      ]);
      if (validationErrors.length > 0) {
        throw new ServerError(validationErrors, 'graphql-error-validate-field');
      }

      // 8. GET must not execute mutations/subscriptions
      if (method === 'GET') {
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
      const result = await execute({
        variableValues: variables,
        document: documentAST,
        contextValue: context,
        schema,
        rootValue,
        operationName,
      });

      // 9.1 No data means execution did not start: a GraphQL request error,
      // e.g. a variable value rejected by a scalar or an unknown operationName.
      // It is caused by the client, so it is reported (and never masked) as a
      // request error, not as an execution error.
      if (!('data' in result) && result.errors?.length) {
        throw new ServerError(result.errors, 'graphql-error-validate-request');
      }

      // 10. Success response
      return finish({
        data: result.data,
        errors: formatExecutionErrors(result.errors, { debug, maskErrors, onError }),
      });
    } catch (error) {
      // 11. Error response
      return finish({
        errors: formatErrors({
          error,
          debug,
          maskErrors,
          onError,
          context,
        }),
      });
    } finally {
      uploadCleanup?.();
    }
  };

  return httpListener;
};

export default applicationFactory;
