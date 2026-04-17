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
} from 'graphql';

import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import applyMiddlewares from './utils/apply-middlewares';
import formatErrors from './utils/format-errors';
import ServerError from './server-error';
import { buildValidationRules } from './utils/build-validation-rules';
import { buildConfig } from './utils/build-config';

const applicationFactory: ApplicationFactory = props => {
  const config = buildConfig(props);
  const validationRule = buildValidationRules(config);
  const { middleware, schema, rootValue, debug } = config;

  const context: Context = {};
  const stats: CoreStats = { requestCounter: 0, startupTime: new Date() };
  const extensions: GraphQLExtensions = {
    queryTime: 0,
    requestCounter: 0,
    startupTime: stats.startupTime,
  };

  const httpListener: HTTPListener = async (request, response) => {
    const startTime = performance.now();
    stats.requestCounter += 1;

    const finish = (payload: GraphqlResponse) => ({
      ...payload,
      extensions: {
        ...extensions,
        ...stats,
        queryTime: performance.now() - startTime,
      },
    });

    try {
      const method = request.method || '';
      const contentType = request.headers['content-type'] || 'application/json';

      // 1. Validate HTTP method
      if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
        throw new ServerError(
          [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests')],
          'graphql-error-execute',
        );
      }

      // 1.1 validate content-type
      if (contentType !== 'application/json') {
        throw new ServerError(
          [
            new GraphQLError(
              `Expected content-type: application/json. Got «${String(contentType)}»`,
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

      // 3. Validate schema
      const schemaErrors = validateSchema(schema);
      if (schemaErrors.length > 0) {
        throw new ServerError(schemaErrors, 'graphql-error-validate-schema');
      }

      // 4. Parse request body (JSON or multipart)
      const body = await bodyParser({ request, response, config });

      // 5. Extract GraphQL params
      const { query, operationName, variables } = parseGraphQLParams({
        body,
        request,
        config,
      });

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

      // 6. Parse query → AST
      const documentAST = parse(new Source(query, 'GraphQL request'));

      // 7. Validate AST
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRule,
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

      // 10. Success response
      return finish({
        data: result.data,
        errors: result.errors,
        extensions: debug
          ? {
              ...extensions,
              ...stats,
              queryTime: performance.now() - startTime,
            }
          : undefined,
      });
    } catch (error) {
      // 11. Error response
      return finish({
        errors: formatErrors({
          error,
          debug,
          context,
        }),
      });
    }
  };

  return httpListener;
};

export default applicationFactory;
