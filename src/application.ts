import { performance } from 'node:perf_hooks';
import type {
  Configuration,
  Context,
  GraphQLExtensions,
  ApplicationFactory,
  HTTPListener,
  CoreStats,
  RequiredDeep,
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
  DEFAULT_JSON_MAX_BYTES,
  DEFAULT_MAX_FILE_FIELDS,
  DEFAULT_MAX_FILE_PARTS,
  DEFAULT_MAX_FILE_TOTAL_SIZE,
  DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT,
  DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_DEFAULT_LIST_MULTIPLIER,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_INTROSPECTION_COST,
  DEFAULT_MAX_GRAPHQL_COMPLEXITY_MAX_FIELDS_PER_SELECTION,
  DEFAULT_JSON_DECOMPRESSED_MAX_BYTES,
} from './constants';

import bodyParser, { parseGraphQLParams } from './utils/body-parser';
import composeMiddlewares from './utils/compose-middlewares';
import applyMiddlewares from './utils/apply-middlewares';
import formatErrors from './utils/format-errors';
import ServerError from './server-error';
import depthLimitRule from './utils/depth-limit-rule';
import complexityLimit from './utils/сomplexity-limit-rule';

const applicationFactory: ApplicationFactory = props => {
  const config: Configuration = {
    middleware: [],
    debug: false,
    rootValue: undefined,
    persistedQueriesMap: undefined,
    persistedQueryKey: DEFAULT_PERSISTED_QUERY_KEY,
    ...props,
    limits: {
      maxFieldSize: DEFAULT_MAX_FIELD_SIZE,
      maxFileSize: DEFAULT_MAX_FILE_SIZE,
      maxFilesTotalSize: DEFAULT_MAX_FILE_TOTAL_SIZE,
      maxFiles: DEFAULT_MAX_FILES,
      maxFileFields: DEFAULT_MAX_FILE_FIELDS,
      maxFileParts: DEFAULT_MAX_FILE_PARTS,
      maxJSONBodySize: DEFAULT_JSON_MAX_BYTES,
      maxJSONBodyDecompressedSize: DEFAULT_JSON_DECOMPRESSED_MAX_BYTES,

      maxGraphQLDepthLimit: DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT,
      maxGraphQLIntrospectionDepthLimit: DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT,
      ...props.limits,
      complexityLimit: {
        maxComplexity: DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT,
        fieldCost: DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST,
        listArguments: DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS,
        defaultListMultiplier: DEFAULT_MAX_GRAPHQL_COMPLEXITY_DEFAULT_LIST_MULTIPLIER,
        introspectionCost: DEFAULT_MAX_GRAPHQL_COMPLEXITY_INTROSPECTION_COST,
        maxFieldsPerSelection: DEFAULT_MAX_GRAPHQL_COMPLEXITY_MAX_FIELDS_PER_SELECTION,
        ...props.limits?.complexityLimit,
      },
    },
  };

  const { middleware, rootValue, debug, schema } = config;

  const context: Context = {};

  const stats: CoreStats = {
    requestCounter: 0,
    startupTime: new Date(),
  };

  const extensions: GraphQLExtensions = {
    queryTime: 0,
    requestCounter: 0,
    startupTime: stats.startupTime,
  };

  const validationRule: ValidationRule[] = [];

  if (config.limits.maxGraphQLDepthLimit) {
    validationRule.push(
      depthLimitRule({
        maxDepth: config.limits.maxGraphQLDepthLimit,
        maxIntrospectionDepth: config.limits.maxGraphQLDepthLimit, // или другое значение
      }),
    );
  }

  if (config.limits.complexityLimit) {
    validationRule.push(
      complexityLimit({
        maxComplexity: config.limits.complexityLimit.maxComplexity,
        fieldCost: config.limits.complexityLimit.fieldCost,
        listArguments: ['first', 'limit', 'take', 'pageSize', 'size'],
      }),
    );
  }

  const httpListener: HTTPListener = async (request, response) => {
    const startTime = performance.now();
    stats.requestCounter += 1;

    try {
      const { method } = request;

      if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
        throw new ServerError(
          [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests')],
          'graphql-error-execute',
        );
      }

      // Middleware chain
      await applyMiddlewares({
        request,
        middlewares: composeMiddlewares(middleware),
        config,
        context,
        schema,
        stats,
        extensions,
        validationRule,
      });

      // Schema validation
      const schemaErrors = validateSchema(schema);
      if (schemaErrors.length > 0) {
        throw new ServerError(schemaErrors, 'graphql-error-validate-schema');
      }

      // Parse body (JSON or multipart)
      const body = await bodyParser({ request, response, config });

      // Extract query, variables, operationName
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

      // Parse query into AST
      const documentAST = parse(new Source(query, 'GraphQL request'));

      // Validate AST
      const validationErrors = validate(schema, documentAST, [
        ...specifiedRules,
        ...validationRule,
      ]);
      if (validationErrors.length > 0) {
        throw new ServerError(validationErrors, 'graphql-error-validate-field');
      }

      // GET must not perform mutations/subscriptions
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

      // Execute GraphQL
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

      return {
        data,
        extensions: debug
          ? {
              ...extensions,
              ...stats,
              queryTime: performance.now() - startTime,
            }
          : undefined,
      };
    } catch (error: unknown) {
      return {
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
    }
  };

  return httpListener;
};

export default applicationFactory;
