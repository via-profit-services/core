/// <reference types="node" />
import http from 'http';
import https from 'https';
import DeviceDetector from 'device-detector-js';
import { NextFunction, Request, Response } from 'express';
import { GraphQLSchema } from 'graphql';
import { IMiddlewareGenerator } from 'graphql-middleware';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ITypedef, IResolvers } from 'graphql-tools';
import { RedisOptions, Redis as RedisInterface } from 'ioredis';
import { Options as SesstionStoreOptions } from 'session-file-store';
import { ServerOptions as IWebsocketServerOption } from 'ws';
import { IDBConfig, KnexInstance } from './databaseManager';
import { ILoggerCollection } from './logger';
import { IJwtConfig, IAccessToken } from './schemas/auth/types';
export interface IInitProps {
    port?: number;
    endpoint?: string;
    subscriptionEndpoint?: string;
    timezone?: string;
    typeDefs?: ITypedef[];
    middlewares?: IMiddlewareGenerator<any, Partial<IContext>, any>[];
    resolvers?: Array<IResolvers<any, Partial<IContext>>>;
    jwt: IJwtConfig;
    database: Omit<IDBConfig, 'logger' | 'localTimezone'>;
    redis: RedisOptions;
    logger: ILoggerCollection;
    routes?: {
        voyager?: string;
    };
    enableIntrospection?: boolean;
    usePlayground?: boolean;
    useVoyager?: boolean;
    serverOptions?: IServerOptions;
    websocketOptions?: IWebsocketServerOption;
    debug?: boolean;
    staticOptions?: IStaticOptions;
    expressMiddlewares?: IExpressMidlewareContainer[];
    sessions?: SesstionStoreOptions | false;
}
export interface IStaticOptions {
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
export interface IInitDefaultProps extends IInitProps {
    port: number;
    endpoint: string;
    subscriptionEndpoint: string;
    timezone: string;
    routes: {
        playground: string;
        voyager: string;
        [key: string]: string;
    };
    usePlayground: boolean;
    enableIntrospection: boolean;
    useVoyager: boolean;
    debug: boolean;
}
/**
 * Cntext is an object shared by all the resolvers of a specific execution
 */
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    knex: KnexInstance;
    logger: ILoggerCollection;
    timezone: string;
    startTime: any;
    pubsub: RedisPubSub;
    redis: RedisInterface;
    deviceInfo: DeviceDetector.DeviceDetectorResult;
    token: IAccessToken['payload'];
}
export interface ISubServerConfig {
    schema: GraphQLSchema;
    server: https.Server | http.Server;
    context: IContext;
}
export interface IBootstrapCallbackArgs {
    port: number;
    context: IContext;
    resolveUrl: {
        graphql: string;
        graphiql?: string;
        voyager?: string;
        subscriptions?: string;
    };
}
export declare type IExpressMidlewareContainer = (props: {
    context: IContext;
}) => IExpressMiddleware;
export declare type IExpressMiddleware = (request?: Request, response?: Response, next?: NextFunction) => void;
