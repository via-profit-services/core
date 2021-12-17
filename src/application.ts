/* eslint-disable import/max-dependencies */
import type {
  Configuration,
  Context,
  ApplicationFactory,
  HTTPListender,
  CoreStats,
  Middleware,
} from '@via-profit-services/core';
import { EventEmitter } from 'events';
import {
  GraphQLError,
  validateSchema,
  execute,
  specifiedRules,
  parse,
  Source,
  getOperationAST,
  validate,
  ValidationRule,
  GraphQLErrorExtensions,
  GraphQLFormattedError,
} from 'graphql';
import { performance } from 'perf_hooks';

import {
  DEFAULT_SERVER_TIMEZONE,
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


const applicationFactory: ApplicationFactory = async props => {
  const config: Configuration = {
    timezone: DEFAULT_SERVER_TIMEZONE,
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

  const { timezone, middleware, rootValue, debug, schema } = config;

  const coreMiddleware: Middleware = ({ context }) => {
    context.services.core = context.services.core ?? new CoreService({ context });
  };

  class CoreEmitter extends EventEmitter {}

  // Declare main context
  const context: Context = {
    timezone,
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
  const extensions: GraphQLErrorExtensions = {};
  const validationRules: ValidationRule[] = [];

  const httpListener: HTTPListender = async (request, response) => {
    const { method } = request;
    const startTime = performance.now();

    context.request = request;
    stats.requestCounter += 1;

    try {
      if (!['GET', 'POST'].includes(method)) {
        throw new Error('GraphQL only supports GET and POST requests');
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
      });

      // validate request
      const graphqlErrors = validateSchema(schema);
      graphqlErrors;
      if (graphqlErrors.length > 0) {
        throw new ServerError(graphqlErrors, 'validate-schema');
      }

      const body = await bodyParser({ request, response, config });
      const { query, operationName, variables } = parseGraphQLParams({
        body,
        request,
        config,
      });

      const documentAST = parse(new Source(query, 'GraphQL request'));
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
      ]);
      if (validationErrors.length > 0) {
        throw new ServerError(validationErrors, 'validation-field');
      }

      // Only query operations are allowed on GET requests.
      if (method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          throw new Error(
            `Can only perform a ${operationAST.operation} operation from a POST request`,
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
        throw new ServerError(errors, 'execute');
      }

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          data,
          extensions: {
            ...extensions,
            ...stats,
            queryTime: performance.now() - startTime,
          },
        }),
      );
    } catch (err: unknown) {

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');

      response.end(
        JSON.stringify({
          errors: formatErrors(err, debug),
          extensions: {
            ...extensions,
            ...stats,
            queryTime: performance.now() - startTime,
          },
        }),
      );
    }
  };

  return httpListener;
};

export default applicationFactory;
