/// <reference types="node" />
import { EventEmitter } from 'events';
import { GraphQLSchema } from 'graphql';
import { IJwtConfig } from '~/authentificator';
import { DBConfig, KnexInstance } from '~/databaseManager';
import { ILoggerCollection } from '~/logger';
export declare const getRoutes: (endpoint: string, routes: Partial<{
    auth?: string;
    playground?: string;
    voyager?: string;
}>) => Partial<{
    auth?: string;
    playground?: string;
    voyager?: string;
}>;
declare const createApp: (props: IInitProps) => {
    app: import("express-serve-static-core").Express;
    context: IContext;
};
export interface IInitProps {
    port?: number;
    endpoint: string;
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
export default createApp;
export { createApp };
