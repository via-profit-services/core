/* eslint-disable import/max-dependencies */
import type {
  Configuration,
  Context,
  ApplicationFactory,
  MiddlewareExtensions,
} from '@via-profit-services/core';
import { EventEmitter } from 'events';
import { RequestHandler } from 'express';
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
  GraphQLSchema,
} from 'graphql';
import { performance } from 'perf_hooks';

import { DEFAULT_SERVER_TIMEZONE, DEFAULT_PERSISTED_QUERY_KEY } from './constants';
import customFormatErrorFn from './errorHandlers/customFormatErrorFn';
import CoreService from './services/CoreService';
import applyMiddlewares from './utils/apply-middlewares';
import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';

const applicationFactory: ApplicationFactory = async props => {
  const configurtation: Configuration = {
    timezone: DEFAULT_SERVER_TIMEZONE,
    middleware: [],
    debug: process.env.NODE_ENV === 'development',
    rootValue: undefined,
    persistedQueriesMap: undefined,
    persistedQueryKey: DEFAULT_PERSISTED_QUERY_KEY,
    ...props,
  };

  const { timezone, middleware, rootValue, debug } = configurtation;

  class CoreEmitter extends EventEmitter {}

  const initialContext: Context = {
    timezone,
    services: {
      core: null,
    },
    request: null,
    emitter: new CoreEmitter(),
    schema: null,
  };

  initialContext.services.core = new CoreService({ context: initialContext });
  let requestCounter = 0;

  const graphQLExpress: RequestHandler = async (request, response, next) => {
    const { method, headers } = request;

    // just skip if is not a valid graphql request
    if (headers['content-type'] === undefined || headers['content-type'] !== 'application/json') {
      next();

      return;
    }

    initialContext.request = request;
    initialContext.schema = configurtation.schema;
    const middlewares = composeMiddlewares(middleware);
    requestCounter += 1;

    let validationRules: ValidationRule[] = [];
    let schema: GraphQLSchema = initialContext.schema;
    let context: Context = initialContext;
    let extensions: MiddlewareExtensions = {};

    try {
      const middlewaresResponse = await applyMiddlewares({
        context: initialContext,
        config: configurtation,
        schema: initialContext.schema,
        request: initialContext.request,
        extensions: {},
        middlewares,
        requestCounter,
      });

      validationRules = middlewaresResponse.validationRules;
      schema = middlewaresResponse.schema;
      context = middlewaresResponse.context;
      extensions = middlewaresResponse.extensions;

      if (!schema) {
        throw new Error('GraphQL Error. GraphQL middleware options must contain a schema');
      }

      // validate request
      const graphqlErrors = validateSchema(schema);
      if (graphqlErrors.length > 0) {
        throw new GraphQLError(
          graphqlErrors[0].message,
          graphqlErrors[0].nodes,
          graphqlErrors[0].source,
          graphqlErrors[0].positions,
          graphqlErrors[0].path,
          graphqlErrors[0].originalError,
          graphqlErrors[0].extensions,
        );
      }

      const body = await bodyParser(request);
      const { query, operationName, variables } = parseGraphQLParams({
        body,
        request,
        config: configurtation,
      });

      if (!['GET', 'POST'].includes(method)) {
        throw new Error('GraphQL Error. GraphQL only supports GET and POST requests');
      }

      const documentAST = parse(new Source(query, 'GraphQL request'));

      // Validate AST, reporting any errors.
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
      ]);
      if (validationErrors.length > 0) {
        throw new GraphQLError(
          validationErrors[0].message,
          validationErrors[0].nodes,
          validationErrors[0].source,
          validationErrors[0].positions,
          validationErrors[0].path,
          validationErrors[0].originalError,
          validationErrors[0].extensions,
        );
      }

      // Only query operations are allowed on GET requests.
      if (method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          // Otherwise, report a 405: Method Not Allowed error.
          throw new Error(
            `GraphQL Error. Can only perform a ${operationAST.operation} operation from a POST request`,
          );
        }
      }

      const startTime = performance.now();

      const { errors, data } = await execute({
        variableValues: variables,
        document: documentAST,
        contextValue: context,
        schema,
        rootValue,
        operationName,
      });

      if (errors) {
        // GraphQLError.er
        throw new GraphQLError(
          errors[0].message,
          errors[0].nodes,
          errors[0].source,
          errors[0].positions,
          errors[0].path,
          errors[0].originalError,
          errors[0].extensions,
        );
      }

      response.status(200).json({
        data,
        extensions: !debug
          ? undefined
          : {
              ...extensions,
              queryTime: performance.now() - startTime,
            },
      });
    } catch (originalError: any) {
      const errors: GraphQLError[] = [originalError];

      response.status(originalError.status || 200).json({
        data: null,
        errors: errors.map(error => customFormatErrorFn({ error, context, debug })),
      });
    }
  };

  return {
    graphQLExpress,
  };
};

export default applicationFactory;
