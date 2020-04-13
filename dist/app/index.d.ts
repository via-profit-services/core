/// <reference types="node" />
import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';
import { GraphQLSchema } from 'graphql';
import { IMiddlewareGenerator } from 'graphql-middleware';
import { ITypedef, IResolvers } from 'graphql-tools';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { IJwtConfig, IAccessToken } from '../authentificator/authentificator';
import { IDBConfig, KnexInstance } from '../databaseManager';
import { ILoggerCollection } from '../logger';
declare class App {
    props: IInitDefaultProps;
    constructor(props: IInitProps);
    bootstrap(callback?: (args: IBootstrapCallbackArgs) => void): void;
    createSubscriptionServer(config: ISubServerConfig): SubscriptionServer;
    createApp(): {
        app: import("express-serve-static-core").Express;
        context: IContext;
        schema: GraphQLSchema;
        routes: {
            [key: string]: string;
            auth: string;
            playground: string;
            voyager: string;
        };
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
    usePlayground?: boolean;
    playgroundConfig?: any;
    useVoyager?: boolean;
    serverOptions: IServerOptions;
    debug?: boolean;
    useCookie?: boolean;
}
interface IServerOptions extends https.ServerOptions {
    key?: https.ServerOptions['key'];
    cert?: https.ServerOptions['cert'];
    cookieSign: string;
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
        playground?: string;
        voyager?: string;
        subscriptions?: string;
    };
}
