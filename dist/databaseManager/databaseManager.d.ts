import knex, { PgConnectionConfig, MigratorConfig, SeedsConfig } from 'knex';
import { ILoggerCollection } from '../logger';
export declare const recalculateCursor: (sequenceName: string, tableName: string, cursorColumnName?: string) => void;
export declare const knexProvider: (config: IDBConfig) => knex<any, any[]>;
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
