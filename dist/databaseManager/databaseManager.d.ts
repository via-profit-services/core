import knex, { PgConnectionConfig, MigratorConfig, SeedsConfig } from 'knex';
import { ILoggerCollection } from '../logger';
export declare const knexProvider: (config: IDBConfig) => knex<any, unknown[]>;
export default knexProvider;
export declare type KnexInstance = knex;
export interface IDBConfig {
    logger: ILoggerCollection;
    connection: PgConnectionConfig;
    timezone: string;
    localTimezone: string;
    migrations?: MigratorConfig;
    seeds?: SeedsConfig;
}
