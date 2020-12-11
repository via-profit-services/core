import { Context } from '@via-profit-services/core';
import { Request, Response, Handler, NextFunction } from 'express';
import {
  GraphQLError, GraphQLSchema, validateSchema, execute, formatError,
  parse, Source, DocumentNode, getOperationAST, validate, ASTVisitor, ValidationRule,
 } from 'graphql';
import { performance } from 'perf_hooks';

import ServerError from '../errorHandlers/ServerError';

interface GraphqlMiddlewareProps {
  schema: GraphQLSchema;
  context: Context;
  debug: boolean;
  enableIntrospection: boolean;

}

interface Body {
  query: string;
  variables: unknown;
  operationName: string;
}


const disableIntrospectionRule: ValidationRule = (ctx) => ({
  Field: (node) => {
    const type = ctx.getType();

    if (type && ['__Schema!', '__Type!'].indexOf(String(type)) >= 0) {
      ctx.reportError(
        new GraphQLError(
          `Introspection has been disabled. The field «${node.name.value}» of type «${String(type)}» is not allowed.`,
        ),
      );
    }
  },
})


const expressGraphqlMiddleware = (props: GraphqlMiddlewareProps) => {

  const { schema, context, debug, enableIntrospection } = props;
  const { logger } = context;

  const validationRules: ValidationRule[] = [];

  if (!enableIntrospection) {
    validationRules.push(disableIntrospectionRule);
  }

  if (!schema) {
    logger.server.error('GraphQL middleware options must contain a schema');
    throw new ServerError('GraphQL middleware options must contain a schema')
  }

  // validate request
  const graphqlErrors = validateSchema(schema);
  if (graphqlErrors.length > 0) {
    logger.server.error('GraphQL schema validation error', { graphqlErrors });
    throw new ServerError('GraphQL schema validation error.', { graphqlErrors });
  }


  /**
   * Express middleware
   */
  const middleware = async (request: Request<any, any, Body>, response: Response) => {
    const { method, body, headers } = request;
    const { query, variables, operationName } = body;
    const startTime = performance.now();

    if (!['GET', 'POST'].includes(method)) {
      logger.server.error('GraphQL only supports GET and POST requests');
      throw new Error('GraphQL only supports GET and POST requests');
    }

    // Skip requests without content types.
    if (headers['content-type'] === undefined) {
      logger.server.error('Missing Content-Type header');
      throw new Error('Missing Content-Type header');
    }

    if (query == null) {
      throw new Error('Graphql request must provide query string');
    }

    // validate request
    let documentAST: DocumentNode;
    try {
      documentAST = parse(new Source(query, 'GraphQL request'));
    } catch (syntaxErrors) {
      return response.status(500).json({
        errors: syntaxErrors,
      })
    }

    // Validate AST, reporting any errors.
    const validationErrors = validate(schema, documentAST, validationRules);
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
        throw new Error(`Can only perform a ${operationAST.operation} operation from a POST request`);
      }
    }


    try {
      const { errors, data } = await execute({
        schema,
        document: documentAST,
        contextValue: context,
        variableValues: variables,
        operationName,
      });

      if (errors) {
        return response.status(500).json({ errors })
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

      return response.status(500).json({
        errors,
      })
    }

  }

  return middleware;
}

export default expressGraphqlMiddleware;