/// <reference types="node" />
import { EventEmitter } from 'events';
import { Server, ServerOptions } from 'https';
import { GraphQLSchema } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { IJwtConfig } from "../authentificator/authentificator";
import { DBConfig, KnexInstance } from "../databaseManager";
import { ILoggerCollection } from "../logger";
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
    subscriptionsEndpoint?: string;
    timezone?: string;
    schemas: GraphQLSchema[];
    jwt: IJwtConfig;
    database: DBConfig;
    logger: ILoggerCollection;
    routes?: {
        auth?: string;
        playground?: string;
        voyager?: string;
    };
    usePlayground?: boolean;
    useVoyager?: boolean;
    serverOptions: IServerOptions;
}
interface IServerOptions extends ServerOptions {
    key: ServerOptions['key'];
    cert: ServerOptions['cert'];
}
interface IInitDefaultProps extends IInitProps {
    port: number;
    endpoint: string;
    subscriptionsEndpoint: string;
    timezone: string;
    routes: {
        auth: string;
        playground: string;
        voyager: string;
        [key: string]: string;
    };
    usePlayground: boolean;
    useVoyager: boolean;
}
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    knex: KnexInstance;
    logger: ILoggerCollection;
    emitter: EventEmitter;
    timezone: string;
}
export interface ISubServerConfig {
    schema: GraphQLSchema;
    server: Server;
}
export interface IBootstrapCallbackArgs {
    port: number;
    context: IContext;
    resolveUrl: {
        graphql: string;
        auth: string;
        playground?: string;
        voyager?: string;
    };
}
