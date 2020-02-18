import { GraphQLSchema } from 'graphql';
import { IJwtConfig } from '~/authentificator';
import { DBConfig, KnexInstance } from '~/databaseManager';
import { ILoggerCollection } from '~/logger';
declare class Server {
    private props;
    constructor(props: IInitProps);
    startServer(): Promise<void>;
}
interface IInitProps {
    port: number;
    endpoint: string;
    schemas: GraphQLSchema[];
    jwt: IJwtConfig;
    database: DBConfig;
    logger: ILoggerCollection;
}
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    knex: KnexInstance;
    logger: ILoggerCollection;
}
export { Server };
