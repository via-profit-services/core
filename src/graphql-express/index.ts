import type {
  ASTVisitor,
  DocumentNode,
  ValidationRule,
  ValidationContext,
  ExecutionArgs,
  ExecutionResult,
  FormattedExecutionResult,
  GraphQLSchema,
  GraphQLFieldResolver,
  GraphQLTypeResolver,
  GraphQLFormattedError,
} from 'graphql';
import {
  Source,
  GraphQLError,
  parse,
  validate,
  execute,
  formatError,
  validateSchema,
  getOperationAST,
  specifiedRules,
} from 'graphql';
import type { IncomingMessage, ServerResponse } from 'http';

import BadRequestError from '../errorHandlers/BadRequestError';
import ServerError from '../errorHandlers/ServerError';
import parseBody from './parse-body';

// `url` is always defined for IncomingMessage coming from http.Server
type Request = IncomingMessage & {
  url: string;
};

type Response = ServerResponse & {
  json?: (data: unknown) => void;
};

type MaybePromise<T> = Promise<T> | T;


export interface GraphQLParams {
  query: string | null;
  variables: { readonly [name: string]: unknown } | null;
  operationName: string | null;
  raw: boolean;
}


/**
 * Used to configure the graphqlHTTP middleware by providing a schema
 * and other configuration options.
 *
 * Options can be provided as an Object, a Promise for an Object, or a Function
 * that returns an Object or a Promise for an Object.
 */
export type Options =
  | ((
      request: Request,
      response: Response,
      params?: GraphQLParams,
    ) => MaybePromise<OptionsData>)
  | MaybePromise<OptionsData>;

export interface OptionsData {
  /**
   * A GraphQL schema from graphql-js.
   */
  schema: GraphQLSchema;

  /**
   * A value to pass as the context to this middleware.
   */
  context?: unknown;

  /**
   * An object to pass as the rootValue to the graphql() function.
   */
  rootValue?: unknown;

  /**
   * A boolean to configure whether the output should be pretty-printed.
   */
  pretty?: boolean;

  /**
   * An optional array of validation rules that will be applied on the document
   * in additional to those defined by the GraphQL spec.
   */
  validationRules?: ReadonlyArray<(ctx: ValidationContext) => ASTVisitor>;

  /**
   * An optional function which will be used to validate instead of default `validate`
   * from `graphql-js`.
   */
  customValidateFn?: (
    schema: GraphQLSchema,
    documentAST: DocumentNode,
    rules: ReadonlyArray<ValidationRule>,
  ) => ReadonlyArray<GraphQLError>;

  /**
   * An optional function which will be used to execute instead of default `execute`
   * from `graphql-js`.
   */
  customExecuteFn?: (args: ExecutionArgs) => MaybePromise<ExecutionResult>;

  /**
   * An optional function which will be used to format any errors produced by
   * fulfilling a GraphQL operation. If no function is provided, GraphQL's
   * default spec-compliant `formatError` function will be used.
   */
  customFormatErrorFn?: (error: GraphQLError) => GraphQLFormattedError;

  /**
   * An optional function which will be used to create a document instead of
   * the default `parse` from `graphql-js`.
   */
  customParseFn?: (source: Source) => DocumentNode;

  /**
   * An optional function for adding additional metadata to the GraphQL response
   * as a key-value object. The result will be added to "extensions" field in
   * the resulting JSON. This is often a useful place to add development time
   * info such as the runtime of a query or the amount of resources consumed.
   *
   * Information about the request is provided to be used.
   *
   * This function may be async.
   */
  extensions?: (
    info: RequestInfo,
  ) => MaybePromise<undefined | { [key: string]: unknown }>;


  /**
   * A resolver function to use when one is not provided by the schema.
   * If not provided, the default field resolver is used (which looks for a
   * value or method on the source value with the field's name).
   */
  fieldResolver?: GraphQLFieldResolver<unknown, unknown>;

  /**
   * A type resolver function to use when none is provided by the schema.
   * If not provided, the default type resolver is used (which looks for a
   * `__typename` field or alternatively calls the `isTypeOf` method).
   */
  typeResolver?: GraphQLTypeResolver<unknown, unknown>;
}

/**
 * All information about a GraphQL request.
 */
export interface RequestInfo {
  /**
   * The parsed GraphQL document.
   */
  document: DocumentNode;

  /**
   * The variable values used at runtime.
   */
  variables: { readonly [name: string]: unknown } | null;

  /**
   * The (optional) operation name requested.
   */
  operationName: string | null;

  /**
   * The result of executing the operation.
   */
  result: FormattedExecutionResult;

  /**
   * A value to pass as the context to the graphql() function.
   */
  context?: unknown;
}

type Middleware = (request: Request, response: Response) => Promise<void>;


/**
 * Helper function for sending a response using only the core Node server APIs.
 */
const sendResponse = (response: Response, type: string, data: string): void => {
  const chunk = Buffer.from(data, 'utf8');
  response.setHeader('Content-Type', type + '; charset=utf-8');
  response.setHeader('Content-Length', String(chunk.length));
  response.end(chunk);
}

/**
 * Provided a "Request" provided by express or connect (typically a node style
 * HTTPClientRequest), Promise the GraphQL request parameters.
 */
export const getGraphQLParams = async (request: Request): Promise<GraphQLParams> => {
  const urlData = new URLSearchParams(request.url.split('?')[1]);
  const bodyData = await parseBody(request);

  // GraphQL Query string.
  let query = urlData.get('query') ?? (bodyData.query as string | null);
  if (typeof query !== 'string') {
    query = null;
  }

  // Parse the variables if needed.
  let variables = (urlData.get('variables') ?? bodyData.variables) as {
    readonly [name: string]: unknown;
  } | null;
  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch {
      throw new BadRequestError('Variables are invalid JSON.');
    }
  } else if (typeof variables !== 'object') {
    variables = null;
  }

  // Name of GraphQL operation to execute.
  let operationName =
    urlData.get('operationName') ?? (bodyData.operationName as string | null);
  if (typeof operationName !== 'string') {
    operationName = null;
  }

  const raw = urlData.get('raw') != null || bodyData.raw !== undefined;

  return { query, variables, operationName, raw };
}


/**
 * Middleware for express; takes an options object or function as input to
 * configure behavior, and returns an express middleware.
 */
export const graphqlHTTP = (options: Options): Middleware => {
  if (!options) {
    throw new ServerError('GraphQL middleware requires options.');
  }

  return async function graphqlMiddleware(
    request: Request,
    response: Response,
  ): Promise<void> {
    // Higher scoped variables are referred to at various
    // stages in the asynchronous state machine below.
    let params: GraphQLParams | undefined;
    let formatErrorFn = formatError;
    let pretty = false;
    let result: ExecutionResult;

    const resolveOptions = async (requestParams?: GraphQLParams): Promise<OptionsData> => {
      const optionsResult = await Promise.resolve(
        typeof options === 'function'
          ? options(request, response, requestParams)
          : options,
      );

      if (optionsResult === null && typeof optionsResult === 'object') {
        throw new ServerError(
          'GraphQL middleware option function must return an options object or a promise which will be resolved to an options object.',
        );
      }

      return optionsResult;
    }

    try {
      // Parse the Request to get GraphQL request parameters.
      try {
        params = await getGraphQLParams(request);
      } catch (error) {
        // When we failed to parse the GraphQL parameters, we still need to get
        // the options object, so make an options call to resolve just that.
        const optionsData = await resolveOptions();
        pretty = optionsData.pretty ?? false;
        formatErrorFn =
          optionsData.customFormatErrorFn ??
          formatErrorFn;
        throw error;
      }

      // Then, resolve the Options to get OptionsData.
      const optionsData: OptionsData = await resolveOptions(params);

      // Collect information from the options data object.
      const schema = optionsData.schema;
      const rootValue = optionsData.rootValue;
      const validationRules = optionsData.validationRules ?? [];
      const fieldResolver = optionsData.fieldResolver;
      const typeResolver = optionsData.typeResolver;
      const extensionsFn = optionsData.extensions;
      const context = optionsData.context ?? request;
      const parseFn = optionsData.customParseFn ?? parse;
      const executeFn = optionsData.customExecuteFn ?? execute;
      const validateFn = optionsData.customValidateFn ?? validate;

      pretty = optionsData.pretty ?? false;
      formatErrorFn =
        optionsData.customFormatErrorFn ??
        formatErrorFn;

      // Assert that schema is required.
      if (schema === null) {
        throw new ServerError('GraphQL middleware options must contain a schema.')
      }

      // GraphQL HTTP only supports GET and POST methods.
      if (request.method !== 'GET' && request.method !== 'POST') {
        throw new BadRequestError('GraphQL only supports GET and POST requests.', {
          headers: { Allow: 'GET, POST' },
        });
      }

      // Get GraphQL params from the request and POST body data.
      const { query, variables, operationName } = params;

      // If there is no query, but GraphiQL will be displayed, do not produce
      // a result, otherwise return a 400: Bad Request.
      if (query == null) {
        throw new BadRequestError('Must provide query string.');
      }

      // Validate Schema
      const schemaValidationErrors = validateSchema(schema);
      if (schemaValidationErrors.length > 0) {
        // Return 500: Internal Server Error if invalid schema.
        throw new ServerError('GraphQL schema validation error.', {
          graphqlErrors: schemaValidationErrors,
        });
      }

      // Parse source to AST, reporting any syntax error.
      let documentAST;
      try {
        documentAST = parseFn(new Source(query, 'GraphQL request'));
      } catch (syntaxError) {
        // Return 400: Bad Request if any syntax errors errors exist.
        throw new BadRequestError('GraphQL syntax error.', {
          graphqlErrors: [syntaxError],
        });
      }

      // Validate AST, reporting any errors.
      const validationErrors = validateFn(schema, documentAST, [
        ...specifiedRules,
        ...validationRules,
      ]);

      if (validationErrors.length > 0) {
        // Return 400: Bad Request if any validation errors exist.
        throw new BadRequestError('GraphQL validation error.', {
          graphqlErrors: validationErrors,
        });
      }

      // Only query operations are allowed on GET requests.
      if (request.method === 'GET') {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== 'query') {
          // Otherwise, report a 405: Method Not Allowed error.
          throw new BadRequestError(
            `Can only perform a ${operationAST.operation} operation from a POST request.`,
            { headers: { Allow: 'POST' } },
          );
        }
      }

      // Perform the execution, reporting any errors creating the context.
      try {
        result = await executeFn({
          schema,
          document: documentAST,
          rootValue,
          contextValue: context,
          variableValues: variables,
          operationName,
          fieldResolver,
          typeResolver,
        });
      } catch (contextError) {
        // Return 400: Bad Request if any execution context errors exist.
        throw new BadRequestError('GraphQL execution context error.', {
          graphqlErrors: [contextError],
        });
      }

      // Collect and apply any metadata extensions if a function was provided.
      // https://graphql.github.io/graphql-spec/#sec-Response-Format
      if (extensionsFn) {
        const extensions = await extensionsFn({
          document: documentAST,
          variables,
          operationName,
          result,
          context,
        });

        if (extensions != null) {
          result = { ...result, extensions };
        }
      }
    } catch (error) {

      // throw new ServerError('', { err });
      // If an error was caught, report the httpError status, or 500.
      // const error: HttpError = httpError(
      //   500,
      //   /* istanbul ignore next: Thrown by underlying library. */
      //   rawError instanceof Error ? rawError : String(rawError),
      // );

      response.statusCode = error.status;

      const { headers } = error;
      if (headers != null) {
        for (const [key, value] of Object.entries(headers)) {
          response.setHeader(key, String(value));
        }
      }

      if (error.graphqlErrors == null) {
        const graphqlError = new GraphQLError(
          error.message,
          undefined,
          undefined,
          undefined,
          undefined,
          error,
        );
        result = { data: undefined, errors: [graphqlError] };
      } else {
        result = { data: undefined, errors: error.graphqlErrors };
      }
    }

    // If no data was included in the result, that indicates a runtime query
    // error, indicate as such with a generic status code.
    // Note: Information about the error itself will still be contained in
    // the resulting JSON payload.
    // https://graphql.github.io/graphql-spec/#sec-Data
    if (response.statusCode === 200 && result.data == null) {
      response.statusCode = 500;
    }

    // Format any encountered errors.
    const formattedResult: FormattedExecutionResult = {
      ...result,
      errors: result.errors?.map(formatErrorFn),
    };


    // If "pretty" JSON isn't requested, and the server provides a
    // response.json method (express), use that directly.
    // Otherwise use the simplified sendResponse method.
    if (!pretty && typeof response.json === 'function') {
      response.json(formattedResult);
    } else {
      const payload = JSON.stringify(formattedResult, null, pretty ? 2 : 0);
      sendResponse(response, 'application/json', payload);
    }
  };
}

