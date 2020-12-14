import { Context } from '@via-profit-services/core';
import { Request, Response } from 'express';
import {
  GraphQLError, GraphQLSchema, validateSchema, execute, specifiedRules,
  parse, Source, DocumentNode, getOperationAST, validate, ValidationRule,
 } from 'graphql';
import { performance } from 'perf_hooks';

import BadRequestError from '../errorHandlers/BadRequestError';
import customFormatErrorFn from '../errorHandlers/customFormatErrorFn';
import ServerError from '../errorHandlers/ServerError';

interface ExpressGraphqlMiddlewareProps {
  schema: GraphQLSchema;
  context: Context;
  debug: boolean;
  rootValue: unknown;
  validationRules: ReadonlyArray<ValidationRule>;
}

interface Body {
  query: string;
  variables: unknown;
  operationName: string;
}


const expressGraphqlMiddleware = (props: ExpressGraphqlMiddlewareProps) => {

  const { schema, context, debug, rootValue, validationRules } = props;

  if (!schema) {
    throw new ServerError('GraphQL middleware options must contain a schema')
  }

  // validate request
  const graphqlErrors = validateSchema(schema);
  if (graphqlErrors.length > 0) {
    throw new ServerError('GraphQL schema validation error.', { graphqlErrors });
  }


  /**
   * Express middleware
   */
  const middleware = async (request: Request<any, any, Body>, response: Response) => {
    const { method, body } = request;
    const { query, variables, operationName } = body;
    const startTime = performance.now();
    let documentAST: DocumentNode;

    try {
      if (!['GET', 'POST'].includes(method)) {
        throw new BadRequestError('GraphQL only supports GET and POST requests');
      }

      // Skip requests without content types.
      // if (headers['content-type'] === undefined) {
      //   throw new BadRequestError('Missing Content-Type header');
      // }

      if (query == null) {
        throw new BadRequestError('GraphQL request must provide query string');
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

  return middleware;
}

export default expressGraphqlMiddleware;