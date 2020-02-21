/// <reference types="node" />
import { EventEmitter } from 'events';
import { Server } from 'http';
import { GraphQLSchema } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { IJwtConfig } from '~/authentificator/authentificator';
import { DBConfig, KnexInstance } from '~/databaseManager';
import { ILoggerCollection } from '~/logger';
declare class App {
    props: IInitDefaultProps;
    constructor(props: IInitProps);
    bootstrap(): void;
    createSubscriptionServer(config: ISubServerConfig): SubscriptionServer;
    createApp(): {
        app: import("express-serve-static-core").Express;
        context: IContext;
        schema: GraphQLSchema;
        routes: {
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
}
interface IInitDefaultProps extends IInitProps {
    port: number;
    endpoint: string;
    subscriptionsEndpoint: string;
    routes: {
        auth: string;
        playground: string;
        voyager: string;
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
}
export interface ISubServerConfig {
    schema: GraphQLSchema;
    server: Server;
}
