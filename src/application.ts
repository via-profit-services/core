/* eslint-disable import/max-dependencies */
import type {
  Configuration, Context, ApplicationFactory, MiddlewareExtensions,
} from '@via-profit-services/core';
import express, { Request, Response } from 'express';
import {
  GraphQLError, validateSchema, execute, specifiedRules,
  parse, Source, getOperationAST, validate, ValidationRule, GraphQLSchema,
 } from 'graphql';
import { performance } from 'perf_hooks';

import {
  DEFAULT_INTROSPECTION_STATE, DEFAULT_SERVER_TIMEZONE,
  DEFAULT_LOG_DIR, MAXIMUM_REQUEST_BODY_SIZE,
} from './constants';
import BadRequestError from './errorHandlers/BadRequestError';
import customFormatErrorFn from './errorHandlers/customFormatErrorFn';
import ServerError from './errorHandlers/ServerError';
import configureLogger from './logger/configure-logger';
import graphqlIntrospectionMiddleware from './middleware/introspection';
import applyMiddlewares from './utils/apply-middlewares';
import composeMiddlewares from './utils/compose-middlewares';


interface Body {
  query: string;
  variables: unknown;
  operationName: string;
}


const applicationFactory: ApplicationFactory = async (props) => {
  const configurtation: Configuration = {
    timezone: DEFAULT_SERVER_TIMEZONE,
    middleware: [],
    enableIntrospection: DEFAULT_INTROSPECTION_STATE,
    logDir: DEFAULT_LOG_DIR,
    debug: process.env.NODE_ENV === 'development',
    rootValue: undefined,
    ...props,

  };


  const { timezone, logDir, middleware, rootValue, debug } = configurtation;
  const logger = configureLogger({ logDir });

  // combine finally context object
  const initialContext: Context = {
    timezone,
    logger,
    dataloader: {},
    services: {},
  };

  // // json
  const expressJSONMiddleware = express.json({
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });

  // // url encoded
  const expressUrlEncodedMiddleware = express.urlencoded({
    extended: true,
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });


  const expressGraphqlMiddleware = async (
    request: Request<any, any, Body>,
    response: Response,
  ) => {
    const middlewares = composeMiddlewares(
      graphqlIntrospectionMiddleware(),
      middleware,
    );


    let validationRules: ValidationRule[] = [];
    let context: Context = initialContext;
    let schema: GraphQLSchema = configurtation.schema;
    let extensions: MiddlewareExtensions = {};

    try {
      try {
        const middlewaresResponse = await applyMiddlewares({
          context: initialContext,
          config: configurtation,
          schema: configurtation.schema,
          extensions: {},
          middlewares,
          request,
        });
        validationRules = middlewaresResponse.validationRules;
        context = middlewaresResponse.context;
        schema = middlewaresResponse.schema;
        extensions = middlewaresResponse.extensions;

      } catch (err) {
        throw new ServerError('GraphQL Error. Failed to load middlewares', { err });
      }


      if (!schema) {
        throw new ServerError('GraphQL Error. GraphQL middleware options must contain a schema', { schema });
      }

      // validate request
      const graphqlErrors = validateSchema(schema);
      if (graphqlErrors.length > 0) {
        throw new ServerError('GraphQL Error. GraphQL schema validation error.', { graphqlErrors });
      }

      const { method, body, headers } = request;
      const { query, variables, operationName } = body;

      if (!['GET', 'POST'].includes(method)) {
        throw new BadRequestError('GraphQL Error. GraphQL only supports GET and POST requests');
      }

      if (!query) {
        return;
        // throw new BadRequestError('GraphQL Error. GraphQL request must provide query string');
      }

      // Skip requests without content types.
      if (headers['content-type'] === undefined) {
        throw new BadRequestError('GraphQL Error. Missing Content-Type header');
      }


      const documentAST = parse(new Source(query, 'GraphQL request'));

      // Validate AST, reporting any errors.
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
      ]);
      if (validationErrors.length > 0) {
        throw new BadRequestError('GraphQL Error. Validation Error', { graphqlErrors: validationErrors })
      }


      // Only query operations are allowed on GET requests.
      if (method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          // Otherwise, report a 405: Method Not Allowed error.
          throw new BadRequestError(`GraphQL Error. Can only perform a ${operationAST.operation} operation from a POST request`);
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
        throw new ServerError('GraphQL Error.', { graphqlErrors: errors });
      }

      response.status(200).json({
        data,
        extensions: {
          ...extensions,
          queryTime: performance.now() - startTime,
        },
      })

    } catch (originalError) {

      const errors: GraphQLError[] = originalError?.metaData?.graphqlErrors ?? [];

      response.status(originalError.status ?? 500).json({
        data: null,
        errors: errors.map((error) => customFormatErrorFn({ error, context, debug })),
      });
    }

  }

  const viaProfitGraphql = express.Router();
  viaProfitGraphql.use(expressJSONMiddleware);
  viaProfitGraphql.use(expressUrlEncodedMiddleware);
  viaProfitGraphql.use(expressGraphqlMiddleware);

  return {
    viaProfitGraphql,
  };
}

export default applicationFactory;