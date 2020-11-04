import knex from 'knex';
import * as Knex from 'knex';
import { ILoggerCollection } from '../logger';
export declare const knexProvider: (config: IDBConfig) => knex<any, unknown[]>;
export default knexProvider;
export { knex, Knex };
export interface IDBConfig {
    logger: ILoggerCollection;
    connection: Knex.PgConnectionConfig;
    timezone?: string;
    localTimezone: string;
    migrations?: Knex.MigratorConfig;
    seeds?: Knex.SeederConfig;
    pool?: Knex.PoolConfig;
}
