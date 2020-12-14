// Type definitions for @via-profit-services/core
// Project: git@github.com:via-profit-services/core
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

/// <reference types="node" />
declare module '@via-profit-services/core' {
  import { GraphQLSchema } from 'graphql';
  import { RedisPubSub } from 'graphql-redis-subscriptions';
  import { withFilter } from 'graphql-subscriptions';
  import DataLoader from 'dataloader';
  import { Router } from 'express';
  import http from 'http';
  import { RedisOptions, Redis as RedisInterface } from 'ioredis';
  import { Options as SesstionStoreOptions } from 'session-file-store';
  import Winston from 'winston';
  import 'winston-daily-rotate-file';

  
  export interface Context {
    logger: LoggersCollection;
    timezone: string;
    startTime: any;
    pubsub: RedisPubSub;
    redis: RedisInterface;
    dataloader: DataLoaderCollection;
  }

  export interface DataLoaderCollection {
    core: DataLoader<string, Node<unknown>>;
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
  
  export type ApplicationFactory = (props: InitProps) => Router;

  export type SubscriptionsFactory = (server: http.Server, config: Configuration, context: Context) => void;

  export type PubsubFactory = (config: Configuration, logger: LoggersCollection) => {
    pubsub: RedisPubSub;
    redis: RedisInterface;
  }

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
       * Allow introspection queries
       * \
       * Default: `false`
       */
      enableIntrospection?: boolean;
      /**
       * GraphQL Schema Definition
       * @see: https://graphql.org
       */
      schema: GraphQLSchema;
      redis?: RedisOptions;
      debug?: boolean;
      sessions?: SesstionStoreOptions;
      rootValue?: unknown;
      // middleware?: Middleware | Middleware[];
  }

  
  // export interface MiddlewareProps {
  //   config: Configuration;
  //   request: http.IncomingMessage;
  // }

  // export type Middleware = (props: MiddlewareProps) => GraphqlMiddleware;
  // export type GraphqlMiddleware = IMiddleware<any, Context, any>;
  export interface Configuration extends Required<InitProps> {
      timezone: string;
      logDir: string;
      debug: boolean;
      rootValue: unknown;
      enableIntrospection: boolean;
  }
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
  /**
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
  
  /**
   * Convert string to cursor base64 string
   */
  export type StringToCursor = (str: string) => string;
  /**
   * Convert base64 cursor to string
   */
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
  
  export const logFormatter: Winston.Logform.Format;
  export const resolvers: any;
  export const stringToCursor: StringToCursor;
  export const cursorToString: CursorToString;
  export const makeNodeCursor: MakeNodeCursor;
  export const getCursorPayload: GetCursorPayload;
  export const buildCursorConnection: BuildCursorConnection;
  export const nodeToEdge: NodeToEdge;
  export const extractNodeField: ExtractNodeField;
  export const extractNodeIds: ExtractNodeIds;
  export const collateForDataloader: CollateForDataloader;
  export const arrayOfIdsToArrayOfObjectIds: ArrayOfIdsToArrayOfObjectIds;
  export const applyAliases: ApplyAliases;
  export const buildQueryFilter: BuildQueryFilter;
  export const typeDefs: string;

  export const LOG_FILENAME_DEBUG: string;
  export const LOG_FILENAME_ERRORS: string;
  export const LOG_FILENAME_WARNINGS: string;
  export const LOG_DATE_PATTERNT: string;
  export const LOG_MAX_SIZE: string;
  export const LOG_MAX_FILES: string;

  const applicationFactory: ApplicationFactory;

  export { withFilter };
  export default applicationFactory;
}
