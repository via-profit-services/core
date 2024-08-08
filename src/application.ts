import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import type {
  Configuration,
  Context,
  GraphQLExtensions,
  ApplicationFactory,
  HTTPListener,
  CoreStats,
  Middleware,
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
  ValidationRule,
  GraphQLError,
} from 'graphql';

import {
  DEFAULT_PERSISTED_QUERY_KEY,
  DEFAULT_MAX_FIELD_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
} from './constants';
import CoreService from './services/CoreService';
import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import applyMiddlewares from './utils/apply-middlewares';
import formatErrors from './utils/format-errors';
import ServerError from './server-error';

const applicationFactory: ApplicationFactory = props => {
  const config: Configuration = {
    middleware: [],
    debug: false,
    rootValue: undefined,
    persistedQueriesMap: undefined,
    persistedQueryKey: DEFAULT_PERSISTED_QUERY_KEY,
    maxFieldSize: DEFAULT_MAX_FIELD_SIZE,
    maxFileSize: DEFAULT_MAX_FILE_SIZE,
    maxFiles: DEFAULT_MAX_FILES,
    ...props,
  };

  const { middleware, rootValue, debug, schema } = config;

  const coreMiddleware: Middleware = ({ context }) => {
    context.services.core = context.services.core ?? new CoreService({ context });
  };

  class CoreEmitter extends EventEmitter {}

  // Declare main context
  const context: Context = {
    request: null,
    services: {
      core: null,
    },
    emitter: new CoreEmitter(),
    schema,
  };

  const stats: CoreStats = {
    requestCounter: 0,
    startupTime: new Date(),
  };

  // compose middlewares to single array of middlewares
  // Core middleware must be a first of this array
  const middlewares = composeMiddlewares(coreMiddleware, middleware);
  const extensions: GraphQLExtensions = {
    queryTime: 0,
    requestCounter: 0,
    startupTime: new Date(),
  };
  const validationRule: ValidationRule[] = [];

  const httpListener: HTTPListener = async (request, response) => {
    const { method } = request;
    const startTime = performance.now();

    context.request = request;
    stats.requestCounter += 1;

    try {
      if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
        throw new ServerError(
          [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests', {})],
          'graphql-error-execute',
        );
      }

      // execute each middleware
      await applyMiddlewares({
        request,
        middlewares,
        config,
        context,
        schema,
        stats,
        extensions,
        validationRule,
      });

      // validate request
      const graphqlErrors = validateSchema(schema);

      if (graphqlErrors.length > 0) {
        throw new ServerError(graphqlErrors, 'graphql-error-validate-schema');
      }

      const body = await bodyParser({ request, response, config });
      const { query, operationName, variables } = parseGraphQLParams({
        body,
        request,
        config,
      });

      if (typeof query !== 'string' || query === '') {
        throw new ServerError(
          [
            new GraphQLError(
              `Failed to parse Graphql query. The received request is empty. Got «${String(
                query,
              )}»`,
            ),
          ],
          'graphql-error-validate-request',
        );
      }

      const documentAST = parse(new Source(query, 'GraphQL request'));

      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRule,
      ]);
      if (validationErrors.length > 0) {
        throw new ServerError(validationErrors, 'graphql-error-validate-field');
      }

      // Only query operations are allowed on GET requests.
      if (method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          throw new ServerError(
            [
              new GraphQLError(
                `Can only perform a ${operationAST.operation} operation from a POST request`,
                {},
              ),
            ],
            'graphql-error-execute',
          );
        }
      }

      const { errors, data } = await execute({
        variableValues: variables,
        document: documentAST,
        contextValue: context,
        schema,
        rootValue,
        operationName,
      });

      if (errors) {
        throw new ServerError(errors, 'graphql-error-execute');
      }

      const r: GraphqlResponse = {
        data,
        extensions: debug
          ? {
              ...extensions,
              ...stats,
              queryTime: performance.now() - startTime,
            }
          : undefined,
      };

      return r;
    } catch (error: unknown) {
      const r: GraphqlResponse = {
        errors: formatErrors({
          error,
          debug,
          context,
        }),
        extensions: {
          ...extensions,
          ...stats,
          queryTime: performance.now() - startTime,
        },
      };

      return r;
    }
  };

  return httpListener;
};

export default applicationFactory;
