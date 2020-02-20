/// <reference types="node" />
import { EventEmitter } from 'events';
import { GraphQLSchema } from 'graphql';
import { IJwtConfig } from '~/authentificator';
import { DBConfig, KnexInstance } from '~/databaseManager';
import { ILoggerCollection } from '~/logger';
declare class App {
    static buildRoutes(endpoint: string, routes: Partial<IInitProps['routes']>): Partial<IInitProps['routes']>;
    static createApp(props: IInitProps): {
        app: import("express-serve-static-core").Express;
        context: IContext;
        schema: GraphQLSchema;
        routes: Partial<{
            auth?: string;
            playground?: string;
            voyager?: string;
        }>;
        port?: number;
        endpoint: string;
        subscriptionsEndpoint: string;
        schemas: GraphQLSchema[];
        jwt: IJwtConfig;
        database: DBConfig;
        logger: ILoggerCollection;
    };
}
export default App;
export { App };
export interface IInitProps {
    port?: number;
    endpoint: string;
    subscriptionsEndpoint: string;
    schemas: GraphQLSchema[];
    jwt: IJwtConfig;
    database: DBConfig;
    logger: ILoggerCollection;
    routes?: {
        auth?: string;
        playground?: string;
        voyager?: string;
    };
}
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    knex: KnexInstance;
    logger: ILoggerCollection;
    emitter: EventEmitter;
}
