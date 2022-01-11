// Type definitions for @via-profit-services/core
// Project: git@github.com:via-profit-services/core
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

declare module '@via-profit-services/core' {
  import {
    GraphQLSchema,
    ValidationRule,
    GraphQLFieldResolver,
    GraphQLScalarType,
    ExecutionArgs,
    ExecutionResult,
    GraphQLField,
    GraphQLObjectType,
    GraphQLResolveInfo,
    GraphQLError,
  } from 'graphql';
  import { Request, RequestHandler } from 'express';
  import http from 'http';
  import { EventEmitter } from 'events';

  interface CoreServiceProps {
    context: Context;
  }

  type Args = Record<string, unknown>;

  type MakeGraphQLRequestParams = {
    query: string;
    operationName: ExecutionArgs['operationName'];
    variables: ExecutionArgs['variableValues'];
  };

  export class CoreService {
    props: CoreServiceProps;
    constructor(props: CoreServiceProps);
    makeGraphQLRequest<T = { [key: string]: any }>(
      params: MakeGraphQLRequestParams,
    ): MaybePromise<ExecutionResult<T>>;
  }

  type GraphQLErrorEmitCallback = (data: {
    message: string;
    error: GraphQLError;
    stack: string[];
  }) => void;

  export class CoreEmitter extends EventEmitter {
    on(event: 'graphql-error', callback: GraphQLErrorEmitCallback): this;
    once(event: 'graphql-error', callback: GraphQLErrorEmitCallback): this;
  }

  type Resolvers = {
    Query: {
      core: GraphQLFieldResolver<unknown, Context>;
    };
    Mutation: {
      core: GraphQLFieldResolver<
        unknown,
        Context,
        {
          str: string;
        }
      >;
    };
    Date: GraphQLScalarType;
    Time: GraphQLScalarType;
    DateTime: GraphQLScalarType;
    EmailAddress: GraphQLScalarType;
    URL: GraphQLScalarType;
    JSON: GraphQLScalarType;
    Money: GraphQLScalarType;
    Void: GraphQLScalarType;
  };

  export type MaybePromise<T> = Promise<T> | T;

  export type WithKey<K extends string | number | symbol, ResType> = {
    [key in K]: ResType;
  };

  export type ExtractKeyAsObject = <T, K extends keyof T, D>(
    source: T,
    key: K,
    defaultValue?: D,
  ) => {
    [key in K]: T[K] | D;
  };

  export interface Context {
    timezone: string;
    services: ServicesCollection;
    emitter: CoreEmitter;
    request: Request;
    schema: GraphQLSchema;
  }

  export interface ServicesCollection {
    core: CoreService;
    [key: string]: unknown;
  }

  export type ApplicationFactory = (props: InitProps) => Promise<{
    graphQLExpress: RequestHandler;
  }>;

  export type PersistedQueriesMap = Record<string, string>;

  export interface InitProps {
    server: http.Server;
    /**
     * Persisted Queries map (Object contains key: value pairs). \
     * If persisted queries map is passed, the server will ignore \
     * the query directive in body request and read the map using \
     * the `documentId` key, unless otherwise specified (persistedQueryKey option)
     * @see https://relay.dev/docs/en/persisted-queries.html
     */
    persistedQueriesMap?: PersistedQueriesMap;

    /**
     * Used only together with the `persistedQueriesMap` option.\
     * The name of the parameter that will be passed the ID of the query in the Persisted Queries map.
     * \
     * Default: `documentId`
     */
    persistedQueryKey?: string;
    /**
     * Server timezone
     * \
     * Default: `UTC`
     */
    timezone?: string;
    /**
     * GraphQL Schema Definition
     * @see: https://graphql.org
     */
    schema: GraphQLSchema;
    /**
     * Debug mode \
     * \
     * Default: `false`
     */
    debug?: boolean;
    rootValue?: unknown;
    middleware?: Middleware | Middleware[];
  }

  export interface MiddlewareProps {
    config: Configuration;
    context: Context;
    request: Request;
    schema: GraphQLSchema;
    extensions: MiddlewareExtensions;
  }

  export interface MiddlewareResponse {
    context?: Context;
    validationRule?: ValidationRule | ValidationRule[];
    schema?: GraphQLSchema;
    extensions?: MiddlewareExtensions;
  }

  export interface MiddlewareExtensions {
    [key: string]: any;
  }

  export type Middleware = (props: MiddlewareProps) => MaybePromise<MiddlewareResponse>;

  export type Configuration = Required<InitProps>;

  export interface SubServerConfig {
    schema: GraphQLSchema;
    server: http.Server;
    context: Context;
  }

  export interface ErrorHandler extends Error {
    message: string;
    status?: number;
    stack?: string;
    metaData?: any;
  }
  /**
   * GraphQL Cursor connection
   * @see https://facebook.github.io/relay/graphql/connections.htm
   */
  export interface CursorConnection<T> {
    edges: Edge<T>[];
    pageInfo: PageInfo;
    totalCount: number;
  }
  /**
   * GraphQL PageInfo
   * @see https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo
   */
  export interface PageInfo {
    startCursor?: string;
    endCursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }
  /**
   * GraphQL Node type
   * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
   */
  export type Node<T> = T & {
    id: string;
  };
  /**
   * GraphQL Edge type
   * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
   */
  export interface Edge<T> {
    node: Node<T>;
    cursor: string;
  }
  export interface ListResponse<T> {
    totalCount: number;
    offset: number;
    limit: number;
    nodes: Node<T>[];
    orderBy: OrderBy;
    where: Where;
    revert: boolean;
  }
  export interface CursorConnectionProps<T> {
    totalCount: number;
    limit: number;
    nodes: Node<T>[];
    offset?: number;
    orderBy?: OrderBy;
    where?: Where;
    revert?: boolean;
  }
  export interface BetweenDate {
    start: Date;
    end: Date;
  }
  export interface BetweenTime {
    start: string;
    end: string;
  }
  export interface BetweenDateTime {
    start: Date;
    end: Date;
  }
  export interface BetweenInt {
    start: number;
    end: number;
  }
  export interface BetweenMoney {
    start: number;
    end: number;
  }
  export interface Between {
    [key: string]: BetweenDate | BetweenTime | BetweenDateTime | BetweenInt | BetweenMoney;
  }
  export interface InputFilter {
    first?: number;
    offset?: number;
    last?: number;
    after?: string;
    before?: string;
    orderBy?: OrderBy;
    search?: InputSearch;
    between?: Between;
    filter?: {
      [key: string]: InputFilterValue | readonly string[] | readonly number[];
    };
  }
  export type InputFilterValue = string | number | boolean | null;
  export type InputSearch =
    | SearchSingleField
    | SearchSingleField[]
    | SearchMultipleFields
    | SearchMultipleFields[];
  interface SearchSingleField {
    field: string;
    query: string;
  }
  interface SearchMultipleFields {
    fields: string[];
    query: string;
  }
  export type OutputSearch = {
    field: string;
    query: string;
  }[];
  export interface OutputFilter {
    limit: number;
    offset: number;
    orderBy: OrderBy;
    where: Where;
    revert: boolean;
    search: OutputSearch | false;
    between: Between;
  }
  export interface CursorPayload {
    offset: number;
    limit: number;
    where: Where;
    orderBy: OrderBy;
    revert: boolean;
  }
  export type OrderBy = {
    field: string;
    direction: DirectionRange;
  }[];
  export type WhereValue =
    | string
    | number
    | boolean
    | null
    | readonly string[]
    | readonly number[]
    | undefined;
  export type WhereField = [string, WhereAction, WhereValue];
  export type Where = WhereField[];

  export type RequestBody = {
    operationName?: unknown;
    query?: unknown;
    variables?: unknown;
    documentId?: unknown;
    [key: string]: unknown;
  };

  export type Source = any;

  export type MutatedField = GraphQLField<Source, Context, Args> & Record<string, boolean>;
  export type MutatedObjectType = GraphQLObjectType<Source, Context> & Record<string, boolean>;

  export type ResolversWrapperFunction = (props: {
    resolve: GraphQLFieldResolver<Source, Context, Args>;
    source: Source;
    args: Args;
    context: Context;
    info: GraphQLResolveInfo;
  }) => MaybePromise<{
    resolve?: GraphQLFieldResolver<Source, Context, Args>;
    source?: Source;
    args?: Args;
    context?: Context;
    info?: GraphQLResolveInfo;
  }>;

  export type NoopResolver = GraphQLFieldResolver<Source, Context, Args>;

  export type FieldsWrapper = (
    schema: GraphQLSchema,
    wrapper: ResolversWrapperFunction,
    options?: {
      wrapWithoutResolvers?: boolean;
    },
  ) => GraphQLSchema;

  /**
   * @deprecated Use `ApplyAliases` type of `@via-profit-services/knex` instead
   *
   * Key - is a alias name \
   * Value - is a field alias name or array of names \
   * Use asterisk (\*) for default alias name. \
   * For example: {\
   * books: ['title', 'length'],\
   * info: ['*'],\
   * }
   */
  export type TableAliases = {
    [key: string]: string | string[];
  };

  export type StringToCursor = (str: string) => string;
  export type CursorToString = (str: string) => string;
  export type MakeNodeCursor = (cursorName: string, cursorPayload: CursorPayload) => string;
  export type GetCursorPayload = (cursor: string) => CursorPayload;
  export type BuildCursorConnection = <T>(
    props: CursorConnectionProps<T>,
    cursorName?: string,
  ) => CursorConnection<T>;

  export type NodeToEdge = <T>(
    node: Node<T>,
    cursorName: string,
    cursorPayload: CursorPayload,
  ) => Edge<T>;

  export type ExtractNodeField = <T, K extends keyof Node<T>>(
    nodes: Node<T>[],
    field: K,
  ) => Node<T>[K][];

  export type ExtractNodeIds = <T>(nodes: Node<T>[]) => string[];

  export type CollateForDataloader = <T>(
    ids: ReadonlyArray<string>,
    nodes: Node<T>[],
    returnUndefined?: boolean,
  ) => Node<T>[];
  export type ArrayOfIdsToArrayOfObjectIds = (array: string[]) => {
    id: string;
  }[];

  /**
   * @deprecated Use `ApplyAliases` type of `@via-profit-services/knex` instead
   */
  export type ApplyAliases = (whereClause: Where, aliases: TableAliases) => Where;
  export type BuildQueryFilter = <T extends InputFilter>(args: T) => OutputFilter;

  export class ServerError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
  }
  export class BadRequestError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
  }
  export class ForbiddenError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
  }
  export class NotFoundError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
  }

  export type DirectionRange = 'asc' | 'desc';
  export type WhereAction =
    | '='
    | '<>'
    | '>'
    | '<'
    | '>='
    | '<='
    | 'in'
    | 'notIn'
    | 'like'
    | 'ilike'
    | 'is null'
    | 'is not null';

  export type BodyParser = (reqest: Request) => Promise<RequestBody>;

  export type ResolverFactory<
    Data extends Record<string, any> = any,
    Source extends Record<string, any> = any,
    Args extends Record<string, any> = any,
  > = (field: keyof Data) => GraphQLFieldResolver<Source, Context, Args>;

  export type FieldBuilder = <
    Data extends Record<string, any> = any,
    Source extends Record<string, any> = any,
    Args extends Record<string, any> = any,
  >(
    fields: (keyof Data)[],
    resolverFactory: ResolverFactory<Data, Source, Args>,
  ) => Record<keyof Data, GraphQLFieldResolver<Source, Context, Args>>;

  /**
   * Build GraphQL field resolver. This function takes as its first argument an array of keys of the Type that needs to be resolved. The second argument is the function to which the key name will be passed. The function should return a value of the type for this key.
   * This is useful when you need to modify  the resolver response.
   * 
   * Suppose you need to modify name of the user before response, but you can'n do this in `Query->user` resolver for some reason.
   * 
   * Arguments:
   *  **required** - An array of keys of the Type that needs to be resolved
   *  **required** - A function to be called with the argument containing:
   *    - `field` - Resolver field name. The function should return a value of the type for this key
   * 
   * Returns:
   *  - An object where each key is a graphql resolver
   *  
   * 
   * Schema:
   * 
   * ```graphql
   * type Query {
   *   user(id: ID!): User
   * }
   * 
   * type User {
   *   id: ID!
   *   firstname: String!
   *   lastname: String!
   *   email: String!
   * }
   * ```
   * 
   * Then In this case, the resolver will look like this (not usage `fieldBuilder`):
   * 
   * ```js
   * const resolvers = {
   *   Query: {
   *     user: async (_, args) => UserModel.getUser(args.id),
   *   },
   *   user: {
   *     id: ({ id }) => id,
   *     email: ({ email }) => email,
   *     firstname: ({ id, firstname }) => id === 'e16329cd' ? firstname.toUpperCase() : firstname,
   *     lastname: ({ id, lastname }) => id === 'e16329cd' ? lastname.toUpperCase() : lastname,
   *   },
   * };
   * ```
   * If you use `fieldBuilder`:
   * 
   * ```js
   * const resolvers = {
   *   Query: {
   *     user: async (_, args) => UserModel.getUser(args.id),
   *   },
   *   user: fieldBuilder(
   *     ['id', 'firstname', 'lastname', 'email'],
   *     field => (parent, args, context) => {
   *       if (parent.id === 'e16329cd' && ['firstname', 'lastname'].includes(field)) {
   *         return parent[field].toUpperCase();
   *       }
   * 
   *       return parent[field];
   *     },
   *   ),
   * };
   * ```
   */
  export const fieldBuilder: FieldBuilder;
  /**
   * `OutputFilter` containing the default values
   */
  export const defaultOutputFilter: OutputFilter;
  /**
   * Analogue of https://www.npmjs.com/package/body-parser
   */
  export const bodyParser: BodyParser;
  /**
   * Just encode base64 string
   * _Internal function. Used for GraphQL connection building_
   *
   * ```ts
   * const cursor = stringToCursor(JSON.stringify({ foo: 'bar' }));
   * console.log(cursor); // <-- eyJmb28iOiJiYXIifQ==
   * ```
   */
  export const stringToCursor: StringToCursor;

  /**
   * Just decode base64 string
   * _Internal function. Used for GraphQL connection building_
   *
   * ```ts
   * const data = cursorToString('eyJmb28iOiJiYXIifQ==');
   * console.log(data); // <-- '{"foo":"bar"}'
   * ```
   */
  export const cursorToString: CursorToString;

  /**
   * Returns cursor base64 cursor string by name and cursor payload
   *
   * ```ts
   * const cursor = makeNodeCursor('persons-cursor', {
   *   offset: 0,
   *   limit: 15,
   *   where: [],
   *   orderBy: [{
   *     field: 'name',
   *     direction: 'desc',
   *   }],
   * });
   * console.log(cursor); // <-- eyJvZmZzZXQiOjAsImxpbWl0IjoxNSwid2hlcmUiOltdLCJvcmRlckJ5IjpbeyJmaWVsZCI6Im5hbWUiLCJkaXJlY3Rpb24iOiJkZXNjIn1dfS0tLXBlcnNvbnMtY3Vyc29y
   * ```
   */
  export const makeNodeCursor: MakeNodeCursor;

  /**
   * Convert string to cursor base64 string and return payload
   *
   * ```ts
   * const payload = getCursorPayload('eyJvZmZzZXQiOjAsImxpbWl0IjoxNSwid2hlcmUiOltdLCJvcmRlckJ5IjpbeyJmaWVsZCI6Im5hbWUiLCJkaXJlY3Rpb24iOiJkZXNjIn1dfS0tLXBlcnNvbnMtY3Vyc29y')
   *
   * // {
   * //   offset: 0,
   * //  limit: 15,
   * //  where: [],
   * //  orderBy: [ { field: 'name', direction: 'desc' } ]
   * // }
   *
   * ```
   */
  export const getCursorPayload: GetCursorPayload;

  /**
   * Returns Relay cursor bundle
   *
   * ```ts
   * const cursorBundle = buildCursorConnection({
   *   totalCount: 3,
   *   offset: 0,
   *   limit: 2,
   *   nodes: [
   *     { id: '1', name: 'Ivan', createdAt: new Date(), updatedAt: new Date() },
   *     { id: '2', name: 'Stepan', createdAt: new Date(), updatedAt: new Date() },
   *   ]
   * }, 'persons-cursor');
   *
   * // response -> {
   * //   totalCount: 3,
   * //   edges: [
   * //     {
   * //       node: { id: '1', name: 'Ivan', ... },
   * //       cursor:  'eyJvZmZzZXQiOjEsImxpbWl0Ijoy...'
   * //     },
   * //     {
   * //       node: { id: '2', name: 'Stepan', ... },
   * //       cursor:  'eyJvZmZzZXQiOjIsImxpbWl0Ij...'
   * //     }
   * //   ],
   * //   pageInfo: {
   * //     startCursor:  'eyJvZmZzZXQiOjEsImxpbWl0Ijoy...',
   * //     endCursor:  'eyJvZmZzZXQiOjIsImxpbWl0Ij...',
   * //     hasPreviousPage: false,
   * //     hasNextPage: true
   * //   }
   * // }
   * ```
   */
  export const buildCursorConnection: BuildCursorConnection;

  /**
   * Wrap node to cursor object
   *
   * ```ts
   * const filter = {
   *   offset: 0,
   *   limit: 15,
   *   where: [],
   *   orderBy: [{
   *     field: 'name',
   *     direction: 'desc',
   *   }],
   * }
   *
   * // Get persons list
   * const persons = await service.getPersons(filter);
   *
   * // Map all persons to compile the edge for each
   * const edges = persons.map((person) => {
   *
   *   // You should passed node, cursor name and filter params
   *   return nodeToEdge(person, 'persons-cursor', filter);
   * });
   * console.log(edges); // <-- [{ cursor: 'XGHJGds', node: { id: '1', name: 'Ivan' } }]
   *
   * ```
   */
  export const nodeToEdge: NodeToEdge;

  /**
   * Return array of fields of node
   *
   * ```ts
   * const persons = [
   *   {id: '1', name: 'Ivan'},
   *   {id: '2', name: 'Stepan'},
   *   {id: '3', name: 'Petruha'},
   * ];
   *
   * const names = extractNodeField(persons, 'name');
   * console.log(names); // <-- ['Ivan', 'Stepan', 'Petruha']
   * ```
   */
  export const extractNodeField: ExtractNodeField;

  /**
   * Returns node IDs array
   *
   * ```ts
   * const ids = extractNodeIds([
   *   {id: '1', name: 'Ivan'},
   *   {id: '2', name: 'Stepan'},
   *   {id: '3', name: 'Petruha'},
   * ]);
   *
   * console.log(ids); // <-- ['1', '2', '3'];
   * ```
   */
  export const extractNodeIds: ExtractNodeIds;

  /**
   * Collate rows for dataloader response
   * *From DataLoader docs:*
   * There are a few constraints this function must uphold:
   *   - The Array of values must be the same length as the Array of keys.
   *   - Each index in the Array of values must correspond to the same index in the Array of keys.
   * For details [here](https://github.com/graphql/dataloader#batch-function)
   *
   * ```ts
   * const dataloader = new DataLoader(async (ids: string[]) => {
   *   const nodes = await context.services.accounts.getUsersByIds(ids);
   *
   *   return collateForDataloader(ids, nodes);
   * });
   * ```
   */
  export const collateForDataloader: CollateForDataloader;

  /**
   * Format array of IDs to object with id key\
   * Example:
   *
   * ```ts
   * const ids = arrayOfIdsToArrayOfObjectIds(['1', '2', '3']);
   *
   * console.log(ids); // <-- [{id: '1'}, {id: '2'}, {id: '3'}]
   * ```
   */
  export const arrayOfIdsToArrayOfObjectIds: ArrayOfIdsToArrayOfObjectIds;

  /***
   * Convert input filter (partial from GraphQL request) to persist filter
   */
  export const buildQueryFilter: BuildQueryFilter;

  /**
   * Creates an object containing a specific key\
   * Example:
   *
   * ```ts
   * const source = {
   *   foo: 'Foo',
   *   bar: 12,
   * };
   * const record = extractKeyAsObject(source, 'bar');
   *
   * console.log(record); // <-- { bar: 12 }
   * ```
   */
  export const extractKeyAsObject: ExtractKeyAsObject;

  /**
   * Wrap types resolvers in schema.\
   * You can wrap types without resolvers - will be created noop-resolver to wrap the field
   * **Note:** The resolver function should return all the received parameters.\
   * Example:
   * ```ts
   * const { graphQLExpress } = await factory({
   *   server,
   *   schema,
   *   middleware: [
   *     ({ schema }) => ({
   *       schema: fieldsWrapper(schema, (params) => {
   *         const { resolver, source, args, context, info } = params;
   *         // Do something
   *
   *         return params;
   *       })
   *     }),
   *   ],
   * });
   * ```
   */
  export const fieldsWrapper: FieldsWrapper;
  /**
   * Core type definitions (GraphQL SDL string)
   */
  export const typeDefs: string;
  export const resolvers: Resolvers;
  export const factory: ApplicationFactory;

  export const LOG_FILENAME_DEBUG: string;
  export const LOG_FILENAME_ERRORS: string;
  export const LOG_FILENAME_WARNINGS: string;
  export const LOG_DATE_PATTERNT: string;
  export const LOG_MAX_SIZE: string;
  export const LOG_MAX_FILES: string;
  export const MAXIMUM_REQUEST_BODY_SIZE: string;
  export const DEFAULT_NODES_LIMIT: string;
  export const DEFAULT_SERVER_TIMEZONE: string;
  export const DEFAULT_LOG_DIR: string;
  export const DEFAULT_PERSISTED_QUERY_KEY: string;
}
