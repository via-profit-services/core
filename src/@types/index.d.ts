// Type definitions for @via-profit-services/core
// Project: git@github.com:via-profit-services/core
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

/// <reference types="node" />
declare module '@via-profit-services/core' {
  import { GraphQLSchema, ValidationRule, GraphQLFieldResolver, GraphQLScalarType } from 'graphql';
  import DataLoader from 'dataloader';
  import { Request, RequestHandler } from 'express';
  import http from 'http';
  import Winston from 'winston';
  import 'winston-daily-rotate-file';
  import { EventEmitter } from 'events';

  type GraphQLResponse = {
    [key: string]: any;
  }

  export class CoreEmitter extends EventEmitter {
    on(event: 'graphql-error', error: Error | unknown): this;
    once(event: 'graphql-error', error: Error | unknown): this;
    off(event: 'graphql-error', error: Error | unknown): this;

    on(event: 'graphql-response', callback: (data: GraphQLResponse) => void): this;
    once(event: 'graphql-response', callback: (data: GraphQLResponse) => void): this;
    off(event: 'graphql-response', callback: (data: GraphQLResponse) => void): this;
  }

  type Resolvers = {
    Query: {
      info: GraphQLFieldResolver<unknown, Context>;
    };
    Mutation: {
      info: GraphQLFieldResolver<unknown, Context>;
    };
    InfoQuery: {
      version: GraphQLFieldResolver<unknown, Context>;
    };
    InfoMutation: {
      echo: GraphQLFieldResolver<unknown, Context>;
    };
    Date: GraphQLScalarType;
    Time: GraphQLScalarType;
    DateTime: GraphQLScalarType;
    EmailAddress: GraphQLScalarType;
    URL: GraphQLScalarType;
    JSON: GraphQLScalarType;
    Money: GraphQLScalarType;
    Void: GraphQLScalarType;
  }


  export type MaybePromise<T> = Promise<T> | T;

  export type WithKey<K extends string | number | symbol, ResType> = {
    [key in K]: ResType;
  }

  export type ExtractKeyAsObject = <T, K extends keyof T, D>(
    source: T,
    key: K,
    defaultValue?: D,
  ) => {
    [key in K]: T[K] | D;
  };


  export interface Context {
    logger: LoggersCollection;
    timezone: string;
    dataloader: DataLoaderCollection;
    services: ServicesCollection;
    emitter: CoreEmitter;
  }

  export interface ServicesCollection {
    [key: string]: unknown;
  }

  export interface DataLoaderCollection {
    [key: string]: DataLoader<unknown, unknown>;
  }

  export type Logger = Winston.Logger;
  export interface LoggersCollection {
    /**
     * Server logger \
     *\
    * Transports:
    *  - `warn` - File transport
    *  - `error` - File transport
    *  - `debug` - File transport
    */
    server: Logger;
  }
  export interface LoggersConfig {
    logDir: string;
  }
  
  export type ApplicationFactory = (props: InitProps) => Promise<{
    graphQLExpress: RequestHandler;
  }>;

  export interface InitProps {
      server: http.Server;
      /**
       * Server timezone
       * \
       * Default: `UTC`
       */
      timezone?: string;
      /**
       * Logs directory
       * \
       * Default: `./log`
       */
      logDir?: string;
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
      pageInfo: IPageInfo;
      totalCount: number;
  }
  /**
   * GraphQL PageInfo
   * @see https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo
   */
  export interface IPageInfo {
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
      createdAt: Date;
      updatedAt: Date;
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
      revert?: boolean;
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
  export type InputSearch = SearchSingleField | SearchSingleField[] | SearchMultipleFields;
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
  }
  export type OrderBy = {
    field: string;
    direction: DirectionRange;
  }[];
  export type WhereValue = string | number | boolean | null | readonly string[] | readonly number[] | undefined;
  export type WhereField = [string, WhereAction, WhereValue];
  export type Where = WhereField[];
  


  export type RequestBody = {
    operationName?: unknown;
    query?: unknown;
    variables?: unknown;
    [key: string]: unknown;
  };


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
  export type BuildCursorConnection = <T>(props: CursorConnectionProps<T>, cursorName?: string) => CursorConnection<T>;
  export type NodeToEdge = <T>(node: Node<T>, cursorName: string, cursorPayload: CursorPayload) => Edge<T>;
  export type ExtractNodeField = <T, K extends keyof Node<T>>(nodes: Node<T>[], field: K) => Node<T>[K][];
  export type ExtractNodeIds = <T>(nodes: Node<T>[]) => string[];
  export type CollateForDataloader = <T>(ids: string[], nodes: Node<T>[], returnUndefined?: boolean) => Node<T>[];
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
  export type WhereAction = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'in' | 'notIn' | 'like' | 'ilike' | 'is null' | 'is not null';
  
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
   * const ids = extractNodeField([
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

  /**
   * @deprecated Use `ApplyAliases` function of `@via-profit-services/knex` instead
   */
  export const applyAliases: ApplyAliases;

  /***
   * Convert input filter (partial from GraphQL request) to persist filter
   */
  export const buildQueryFilter: BuildQueryFilter;


  /**
   * Creates an object containing a specific key /
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
   * Core type definitions (GraphQL SDL string)
   */
  export const typeDefs: string;
  export const logFormatter: Winston.Logform.Format;
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
}
