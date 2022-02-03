// Type definitions for @via-profit-services/core
// Project: git@github.com:via-profit-services/core
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

declare module '@via-profit-services/core' {
  import {
    GraphQLSchema,
    GraphQLError,
    GraphQLFieldResolver,
    GraphQLScalarType,
    ExecutionArgs,
    ExecutionResult,
    GraphQLField,
    GraphQLObjectType,
    GraphQLResolveInfo,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLErrorExtensions,
    ValidationRule,
    GraphQLEnumType,
  } from 'graphql';
  import http from 'http';
  import { EventEmitter } from 'events';
  import { ReadStream, WriteStream } from 'fs';
  import { ReadableOptions } from 'stream';

  export interface ReadStreamOptions {
    highWaterMark?: ReadableOptions['highWaterMark'];
    encoding?: ReadableOptions['encoding'];
  }

  export interface InitProps {
    /**
     * GraphQL Schema Definition
     * @see: https://graphql.org
     */
    readonly schema: GraphQLSchema;
    /**
     * Persisted Queries map (Object contains key: value pairs). \
     * If persisted queries map is passed, the server will ignore \
     * the query directive in body request and read the map \
     * @see https://relay.dev/docs/en/persisted-queries.html
     */
    readonly persistedQueriesMap?: PersistedQueriesMap;
    /**
     * Used only together with the `persistedQueriesMap` option.\
     * The name of the parameter that will be passed the ID of the query in the Persisted Queries map.
     * \
     * Default: `documentId`
     */
    readonly persistedQueryKey?: string;
    /**
     * Server timezone
     * \
     * Default: `UTC`
     */
    readonly timezone?: string;
    /**
     * Debug mode \
     * \
     * Default: `false`
     */
    readonly debug?: boolean;
    readonly rootValue?: unknown;
    readonly middleware?: Middleware | Middleware[];
    readonly maxFieldSize?: number;
    readonly maxFileSize?: number;
    readonly maxFiles?: number;
  }

  export interface FilePayload {
    readonly filename: string;
    readonly mimeType: string;
    readonly encoding: string;
    readonly capacitor: WriteStream;
    readonly createReadStream: (options?: ReadStreamOptions) => ReadStream;
  }

  export type UploadedFile = Promise<FilePayload>;

  interface CoreServiceProps {
    context: Context;
  }

  type MakeGraphQLRequestParams = {
    query: string;
    operationName: ExecutionArgs['operationName'];
    variables: ExecutionArgs['variableValues'];
  };

  export class CoreService {
    props: CoreServiceProps;
    constructor(props: CoreServiceProps);

    /**
     * Send GraphQL request
     */
    makeGraphQLRequest<T = ExecutionResult['data']>(
      params: MakeGraphQLRequestParams,
    ): MaybePromise<ExecutionResult<T>>;
    /**
     * Return current module version
     */
    getVersion(): string;
  }

  /**
   * Execute each middleware
   */
  export type ApplyMiddlewares = (props: {
    middlewares: Middleware[];
    request: http.IncomingMessage;
    stats: CoreStats;
    schema: GraphQLSchema;
    context: Context;
    extensions: GraphQLErrorExtensions;
    config: Configuration;
    validationRule: ValidationRule[];
  }) => Promise<void>;

  export class CoreEmitter extends EventEmitter {
    on(event: 'graphql-error-execute', listener: (errors: readonly GraphQLError[]) => void): this;
    once(event: 'graphql-error-execute', listener: (errors: readonly GraphQLError[]) => void): this;
    addListener(
      event: 'graphql-error-execute',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    removeListener(
      event: 'graphql-error-execute',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependListener(
      event: 'graphql-error-execute',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependOnceListener(
      event: 'graphql-error-execute',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    emit(event: 'graphql-error-execute', ...args: [errors: readonly GraphQLError[]]): boolean;
    removeAllListeners(event: 'graphql-error-execute'): this;
    listeners(event: 'graphql-error-execute'): Function[];
    listenerCount(event: 'graphql-error-execute'): number;

    on(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    once(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    addListener(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    removeListener(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependListener(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependOnceListener(
      event: 'graphql-error-validate-field',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    emit(
      event: 'graphql-error-validate-field',
      ...args: [errors: readonly GraphQLError[]]
    ): boolean;
    removeAllListeners(event: 'graphql-error-validate-field'): this;
    listeners(event: 'graphql-error-validate-field'): Function[];
    listenerCount(event: 'graphql-error-validate-field'): number;

    on(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    once(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    addListener(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    removeListener(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependListener(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependOnceListener(
      event: 'graphql-error-validate-request',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    emit(
      event: 'graphql-error-validate-request',
      ...args: [errors: readonly GraphQLError[]]
    ): boolean;
    removeAllListeners(event: 'graphql-error-validate-request'): this;
    listeners(event: 'graphql-error-validate-request'): Function[];
    listenerCount(event: 'graphql-error-validate-request'): number;

    on(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    once(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    addListener(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    removeListener(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependListener(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    prependOnceListener(
      event: 'graphql-error-validate-schema',
      listener: (errors: readonly GraphQLError[]) => void,
    ): this;
    emit(
      event: 'graphql-error-validate-schema',
      ...args: [errors: readonly GraphQLError[]]
    ): boolean;
    removeAllListeners(event: 'graphql-error-validate-schema'): this;
    listeners(event: 'graphql-error-validate-schema'): Function[];
    listenerCount(event: 'graphql-error-validate-schema'): number;
  }

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
    readonly timezone: string;
    readonly services: ServicesCollection;
    readonly emitter: CoreEmitter;
    request: http.IncomingMessage;
    schema: GraphQLSchema;
  }

  export type CoreStats = {
    requestCounter: number;
    readonly startupTime: Date;
  };

  export interface ServicesCollection {
    core: CoreService;
    [key: string]: unknown;
  }

  export type HTTPListender = (
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => MaybePromise<void>;

  export type ApplicationFactory = (props: InitProps) => HTTPListender;

  export type PersistedQueriesMap = Record<string, string>;

  export interface MiddlewareProps {
    readonly config: Configuration;
    readonly stats: CoreStats;
    context: Context;
    validationRule: ValidationRule[];
    request: http.IncomingMessage;
    schema: GraphQLSchema;
    extensions: MiddlewareExtensions;
  }

  export interface MiddlewareExtensions {
    [key: string]: any;
  }

  export type Middleware = (props: MiddlewareProps) => MaybePromise<void>;

  export type Configuration = Required<InitProps>;

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
  export type Node<T, K extends string = 'id'> = T & {
    [key in K]: string;
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
    filter?: InputFilterRecord;
  }

  export type InputFilterRecord = Record<
    string,
    InputFilterValue | readonly string[] | readonly number[] | readonly boolean[]
  >;

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
    | readonly boolean[]
    | undefined;
  export type WhereField = [string, WhereAction, WhereValue];
  export type Where = WhereField[];

  export type RequestBody = {
    operationName?: string;
    query?: string;
    variables?: Record<string, any>;
    [key: string]: unknown;
  };

  export type Source = any;

  type Args = Record<string, unknown>;
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

  export type ExtractNodeIds = <T>(nodes: Node<T, 'id'>[]) => string[];

  export type ArrayOfIdsToArrayOfObjectIds = (array: string[]) => {
    id: string;
  }[];

  export type BuildQueryFilter = <T extends InputFilter>(args: T) => OutputFilter;

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

  export type BodyParser = (props: {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    config: Configuration;
  }) => Promise<RequestBody>;

  export type MultipartParser = (props: {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    config: Configuration;
  }) => Promise<RequestBody>;

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
   * const { httpListener } = await factory({
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
   * Build GraphQL field resolver.\
   * This function takes as its first argument an array of keys\
   * of the Type that needs to be resolved.\
   * The second argument is the function to which the key name will be passed.\
   * The function should return a value of the type for this key\
   * This is useful when you need to modify  the resolver response.
   *
   * SDL:
   * ```graphql
   * type User {
   *   id: ID!
   *   name: String!
   * }
   * ```
   *\
   * Resolver:
   * ```ts
   * const User = fieldBuilder(
   *  ['id', 'name'],
   *  field => async (parent, args, context) => {
   *    const user = parent;
   *
   *    if (field === 'name') {
   *      // compatible
   *      return user.name.replace(/\b\w/g, l => l.toUpperCase());
   *    }
   *
   *    return user[field];
   *  },
   * );
   * ```
   */
  export const fieldBuilder: FieldBuilder;
  export const graphqlHTTPFactory: ApplicationFactory;

  export type ServerErrorType =
    | 'graphql-error-execute'
    | 'graphql-error-validate-field'
    | 'graphql-error-validate-request'
    | 'graphql-error-validate-schema';

  export class ServerError extends Error {
    readonly graphqlErrors: readonly GraphQLError[];
    readonly errorType: ServerErrorType;
    constructor(graphqlErrors: readonly GraphQLError[], errorType: ServerErrorType);
  }

  export const FileUploadScalarType: GraphQLScalarType;
  export const DateScalarType: GraphQLScalarType;
  export const DateTimeScalarType: GraphQLScalarType;
  export const EmailAddressScalarType: GraphQLScalarType;
  export const MoneyScalarType: GraphQLScalarType;
  export const TimeScalarType: GraphQLScalarType;
  export const VoidScalarType: GraphQLScalarType;
  export const URLScalarType: GraphQLScalarType;
  export const JSONScalarType: GraphQLScalarType;
  export const JSONObjectScalarType: GraphQLScalarType;

  export const BetweenDateInputType: GraphQLInputObjectType;
  export const BetweenDateTimeInputType: GraphQLInputObjectType;
  export const BetweenIntInputType: GraphQLInputObjectType;
  export const BetweenMoneyInputType: GraphQLInputObjectType;
  export const BetweenTimeInputType: GraphQLInputObjectType;

  export const ConnectionInterfaceType: GraphQLInterfaceType;
  export const EdgeInterfaceType: GraphQLInterfaceType;
  export const ErrorInterfaceType: GraphQLInterfaceType;
  export const NodeInterfaceType: GraphQLInterfaceType;

  export const OrderDirectionType: GraphQLEnumType;
  export const PageInfoType: GraphQLObjectType;

  export const DEFAULT_SERVER_TIMEZONE: string;
  export const DEFAULT_PERSISTED_QUERY_KEY: string;
  export const DEFAULT_MAX_FIELD_SIZE: number;
  export const DEFAULT_MAX_FILE_SIZE: number;
  export const DEFAULT_MAX_FILES: number;
}
