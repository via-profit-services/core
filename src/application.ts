/* eslint-disable import/max-dependencies */
import type {
  Configuration, Context, ApplicationFactory,
} from '@via-profit-services/core';
import DataLoader from 'dataloader';
import express, { Request, Response, NextFunction } from 'express';
import {
  GraphQLError, validateSchema, execute, specifiedRules,
  parse, Source, DocumentNode, getOperationAST, validate,
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


  const { timezone, logDir, middleware, schema, rootValue, debug } = configurtation;
  const logger = configureLogger({ logDir });
  const coreDataloader = new DataLoader(async (ids: string[]) => ids.map((id) => ({
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })))

  // combine finally context object
  const initialContext: Context = {
    timezone,
    logger,
    dataloader: {
      core: coreDataloader,
    },
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

  const expressErrorMiddleware = (
    error: GraphQLError,
    _req: Request,
    _res: Response,
    _next: NextFunction,
  ) => customFormatErrorFn({ context: initialContext, error, debug });


  const expressGraphqlMiddleware = async (
    request: Request<any, any, Body>,
    response: Response,
  ) => {
    const middlewares = composeMiddlewares(middleware, graphqlIntrospectionMiddleware);
    const { validationRules, context } = await applyMiddlewares({
      context: initialContext,
      config: configurtation,
      schema,
      middlewares,
      request,
    });

    if (!schema) {
      throw new ServerError('GraphQL middleware options must contain a schema')
    }

    // validate request
    const graphqlErrors = validateSchema(schema);
    if (graphqlErrors.length > 0) {
      throw new ServerError('GraphQL schema validation error.', { graphqlErrors });
    }

    const { method, body, headers } = request;
    const { query, variables, operationName } = body;
    const startTime = performance.now();
    let documentAST: DocumentNode;

    try {
      if (!['GET', 'POST'].includes(method)) {
        throw new BadRequestError('GraphQL only supports GET and POST requests');
      }

      if (query == null) {
        throw new BadRequestError('GraphQL request must provide query string');
      }

      // Skip requests without content types.
      if (headers['content-type'] === undefined) {
        throw new BadRequestError('Missing Content-Type header');
      }

      // validate request
      try {
        documentAST = parse(new Source(query, 'GraphQL request'));
      } catch (syntaxErrors) {
        return response.status(500).json({
          errors: syntaxErrors,
        })
      }

      // Validate AST, reporting any errors.
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
      ]);
      if (validationErrors.length > 0) {
        return response.status(500).json({
          errors: validationErrors,
        })
      }


      // Only query operations are allowed on GET requests.
      if (method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          // Otherwise, report a 405: Method Not Allowed error.
          throw new BadRequestError(`Can only perform a ${operationAST.operation} operation from a POST request`);
        }
      }

    } catch (prepareErrors) {
      const errors = new GraphQLError(
        'GraphQL Prepare error',
        undefined,
        undefined,
        undefined,
        undefined,
        prepareErrors,
      );

      return response.status(prepareErrors.status || 500).json({
        errors: [errors].map((error) => customFormatErrorFn({ error, context, debug })),
      })
    }


    try {
      const { errors, data } = await execute({
        variableValues: variables,
        document: documentAST,
        contextValue: context,
        schema,
        rootValue,
        operationName,
      });

      if (errors) {
        return response.json({ errors })
      }

      const extensions = !debug ? undefined : {
        queryTime: {
          value: performance.now() - startTime,
          units: 'ms',
        },
      };

      return response.json({
        data,
        extensions,
      })

    } catch (executionErrors) {
      const errors = new GraphQLError(
        'GraphQL Context error',
        undefined,
        undefined,
        undefined,
        undefined,
        executionErrors,
      );

      return response.status(executionErrors.status || 500).json({
        errors: [errors].map((error) => customFormatErrorFn({ error, context, debug })),
      })
    }
  }

  const viaProfitGraphql = express.Router();
  viaProfitGraphql.use(expressJSONMiddleware);
  viaProfitGraphql.use(expressUrlEncodedMiddleware);
  viaProfitGraphql.use(expressGraphqlMiddleware);
  viaProfitGraphql.use(expressErrorMiddleware);

  return {
    viaProfitGraphql,
  };
}

export default applicationFactory;