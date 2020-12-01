/* eslint-disable import/max-dependencies */
import { NextFunction, Request, Response } from 'express';
import { GraphQLSchema, DocumentNode } from 'graphql';
import { IMiddleware } from 'graphql-middleware';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import http from 'http';
import https from 'https';
import { RedisOptions, Redis as RedisInterface } from 'ioredis';
import { Options as SesstionStoreOptions } from 'session-file-store';
import Winston from 'winston';
import { ServerOptions as WebsocketServerOption } from 'ws';

import './graphql-ext';


export interface LoggersCollection {
  /**
   * Server logger \
   *\
   * Transports:
   *  - `warn` - File transport
   *  - `error` - File transport
   *  - `debug` - File transport
   */
  server: Winston.Logger;
}

export interface LoggersConfig {
  logDir: string;
}


export interface InitProps {
  /**
   * Main port number
   */
  port?: number;

  /**
   * Graphql endpoint\
   * \
   * Default: `/graphql`
   */
  endpoint?: string;

  /**
   * Graphql subscription endpoint\
   * \
   * Default: `/subscriptions`
   */
  subscriptionEndpoint?: string;

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
  redis: RedisOptions;
  serverOptions?: IServerOptions;
  websocketOptions?: WebsocketServerOption;
  debug?: boolean;
  staticOptions?: StaticOptions;
  sessions?: SesstionStoreOptions | false;
  middlewares?: Middleware[];
}

export interface Middleware {
  express?: ExpressMidlewareFactory;
  context?: ContextMiddlewareFacotry;
  graphql?: IMiddleware;
}

export interface MiddlewareFactoryProps {
  context: Context;
  config: InitDefaultProps;
}

export type ExpressMidlewareFactory = (props: MiddlewareFactoryProps) => IExpressMiddleware;

export type IExpressMiddleware = (
  request?: Request,
  response?: Response,
  next?: NextFunction
) => void;


export type ContextMiddlewareFacotry = (props: MiddlewareFactoryProps) => Context;


export interface StaticOptions {
  /** Prefix path (e.g. `/static`) @see https://expressjs.com/ru/starter/static-files.html */
  prefix: string;

  /** Static real path (e.g. `/public`) @see https://expressjs.com/ru/starter/static-files.html */
  staticDir: string;
}

export interface IServerOptions extends https.ServerOptions {
  key?: https.ServerOptions['key'];
  cert?: https.ServerOptions['cert'];
  cookieSign?: string;
}

export interface InitDefaultProps extends InitProps {
  port: number;
  authEndpoint: string;
  endpoint: string;
  subscriptionEndpoint: string;
  timezone: string;
  enableIntrospection: boolean;
  debug: boolean;
  logDir: string;
}

/**
 * Cntext is an object shared by all the resolvers of a specific execution
 */
export interface Context {
  endpoint: string;
  logger: LoggersCollection;
  timezone: string;
  startTime: any;
  pubsub: RedisPubSub;
  redis: RedisInterface;
}

export interface SubServerConfig {
  schema: GraphQLSchema;
  server: https.Server | http.Server;
  context: Context;
}

export interface BootstrapCallbackArgs {
  port: number;
  context: Context;
  resolveUrl: {
    graphql: string;
    subscriptions?: string;
  };
}


export type GraphQLExtension = DocumentNode;
