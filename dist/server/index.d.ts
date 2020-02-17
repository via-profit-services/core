import { GraphQLSchema } from 'graphql';
import { Options, Sequelize } from 'sequelize';
import { IJwtConfig } from '~/authentificator';
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
    database: Options;
    logger: ILoggerCollection;
}
export interface IContext {
    endpoint: string;
    jwt: IJwtConfig;
    sequelize: Sequelize;
    logger: ILoggerCollection;
}
export { Server };
