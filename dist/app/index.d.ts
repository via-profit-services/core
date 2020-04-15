/// <reference types="node" />
import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';
import DeviceDetector from 'device-detector-js';
import { Express } from 'express';
import { GraphQLSchema } from 'graphql';
import { IMiddlewareGenerator } from 'graphql-middleware';
import { ITypedef, IResolvers } from 'graphql-tools';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { ServerOptions as IWebsocketServerOption } from 'ws';
import { IDBConfig, KnexInstance } from '../databaseManager';
import { ILoggerCollection } from '../logger';
import { IJwtConfig, IAccessToken } from "../schemas/auth/service";
declare class App {
    props: IInitDefaultProps;
    constructor(props: IInitProps);
    bootstrap(callback?: (args: IBootstrapCallbackArgs) => void): void;
    createSubscriptionServer(config: ISubServerConfig): SubscriptionServer;
    createApp(): {
        app: Express;
        context: IContext;
        schema: GraphQLSchema;
        routes: IInitProps['routes'];
    };
}
export default App;
export { App };
export interface IInitProps {
    port?: number;
    endpoint?: string;
    subscriptionEndpoint?: string;
    timezone?: string;
    typeDefs?: ITypedef[];
    permissions?: IMiddlewareGenerator<any, IContext, any>[];
    middlewares?: IMiddlewareGenerator<any, IContext, any>[];
    resolvers?: Array<IResolvers<any, IContext>>;
    jwt: IJwtConfig;
    database: Omit<IDBConfig, 'logger' | 'localTimezone'>;
    logger: ILoggerCollection;
    routes?: {
        auth?: string;
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
interface IServerOptions extends https.ServerOptions {
    key?: https.ServerOptions['key'];
    cert?: https.ServerOptions['cert'];
    cookieSign?: string;
}
interface IInitDefaultProps extends IInitProps {
    port: number;
    endpoint: string;
    subscriptionEndpoint: string;
    timezone: string;
    routes: {
        auth: string;
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
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    knex: KnexInstance;
    logger: ILoggerCollection;
    emitter: EventEmitter;
    timezone: string;
    startTime: any;
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
        auth: string;
        graphiql?: string;
        playground?: string;
        voyager?: string;
        subscriptions?: string;
    };
}
