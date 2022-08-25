/* eslint-disable import/max-dependencies */
import type {
  Configuration,
  Context,
  ApplicationFactory,
  MiddlewareExtensions,
  GraphqlResponse,
} from '@via-profit-services/core';
import { EventEmitter } from 'events';
import { RequestHandler } from 'express';
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
  GraphQLSchema,
} from 'graphql';
import { performance } from 'perf_hooks';

import { DEFAULT_SERVER_TIMEZONE, DEFAULT_PERSISTED_QUERY_KEY, DEFAULT_LOG_DIR } from './constants';
import configureLogger from './logger/configure-logger';
import CoreService from './services/CoreService';
import applyMiddlewares from './utils/apply-middlewares';
import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import formatErrors from './utils/format-errors';
import ServerError from './server-error';

const applicationFactory: ApplicationFactory = async props => {
  const configurtation: Configuration = {
    timezone: DEFAULT_SERVER_TIMEZONE,
    logDir: DEFAULT_LOG_DIR,
    middleware: [],
    debug: process.env.NODE_ENV === 'development',
    rootValue: undefined,
    persistedQueriesMap: undefined,
    persistedQueryKey: DEFAULT_PERSISTED_QUERY_KEY,
    ...props,
  };

  const { timezone, logDir, middleware, rootValue, debug } = configurtation;
  const logger = configureLogger({ logDir });

  class CoreEmitter extends EventEmitter {}

  const initialContext: Context = {
    timezone,
    logger,
    dataloader: {},
    services: {
      core: null,
    },
    request: null,
    emitter: new CoreEmitter(),
    schema: null,
    requestCounter: 0,
  };

  initialContext.services.core = new CoreService({ context: initialContext });

  const graphQLExpress: RequestHandler = async (request, response) => {
    initialContext.request = request;
    initialContext.schema = configurtation.schema;
    initialContext.requestCounter += 1;
    const middlewares = composeMiddlewares(middleware);
    const startTime = performance.now();

    let validationRules: ValidationRule[] = [];
    let schema: GraphQLSchema = initialContext.schema;
    let context: Context = initialContext;
    let extensions: MiddlewareExtensions = {};

    if (!['GET', 'POST', 'OPTIONS'].includes(request.method)) {
      throw new ServerError(
        [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests', {})],
        'graphql-error-execute',
      );
    }

    try {
      const middlewaresResponse = await applyMiddlewares({
        context: initialContext,
        config: configurtation,
        schema: initialContext.schema,
        request: initialContext.request,
        extensions: {},
        middlewares,
      });

      validationRules = middlewaresResponse.validationRules;
      schema = middlewaresResponse.schema;
      context = middlewaresResponse.context;
      extensions = middlewaresResponse.extensions;

      if (!schema) {
        throw new ServerError(
          [new GraphQLError('GraphQL middleware options must contain a schema', {})],
          'graphql-error-validate-schema',
        );
      }

      // validate request
      const graphqlErrors = validateSchema(schema);
      if (graphqlErrors.length > 0) {
        throw new ServerError(graphqlErrors, 'graphql-error-validate-schema');
      }

      const { method } = request;
      const body = await bodyParser(request);
      const { query, operationName, variables } = parseGraphQLParams({
        body,
        request,
        config: configurtation,
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

      // Validate AST, reporting any errors.
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
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

      response.status(200).json({
        data,
        extensions: {
          ...extensions,
          queryTime: performance.now() - startTime,
        },
      });
    } catch (error: unknown) {
      const r: GraphqlResponse = {
        errors: formatErrors({
          error,
          debug,
          context,
        }),
        extensions: {
          ...extensions,
          queryTime: performance.now() - startTime,
        },
      };

      response.end(JSON.stringify(r));
    }
  };

  return {
    graphQLExpress,
  };
};

export default applicationFactory;
