/// <reference types="node" />
import http from 'http';
import https from 'https';
import DeviceDetector from 'device-detector-js';
import { GraphQLSchema } from 'graphql';
import { IMiddlewareGenerator } from 'graphql-middleware';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ITypedef, IResolvers } from 'graphql-tools';
import { RedisOptions, Redis as RedisInterface } from 'ioredis';
import { ServerOptions as IWebsocketServerOption } from 'ws';
import { IDBConfig, KnexInstance } from './databaseManager';
import { ILoggerCollection } from './logger';
import { IJwtConfig, IAccessToken } from './schemas/auth/service';
export interface IInitProps {
    port?: number;
    endpoint?: string;
    subscriptionEndpoint?: string;
    timezone?: string;
    typeDefs?: ITypedef[];
    permissions?: IMiddlewareGenerator<any, Partial<IContext>, any>[];
    middlewares?: IMiddlewareGenerator<any, Partial<IContext>, any>[];
    resolvers?: Array<IResolvers<any, Partial<IContext>>>;
    jwt: IJwtConfig;
    database: Omit<IDBConfig, 'logger' | 'localTimezone'>;
    redis: RedisOptions;
    logger: ILoggerCollection;
    routes?: {
        playground?: string;
        voyager?: string;
    };
    enableIntrospection?: boolean;
    usePlayground?: boolean;
    playgroundConfig?: any;
    useVoyager?: boolean;
    serverOptions?: IServerOptions;
    websocketOptions?: IWebsocketServerOption;
    debug?: boolean;
    useCookie?: boolean;
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
    useCookie: boolean;
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
        playground?: string;
        voyager?: string;
        subscriptions?: string;
    };
}
