import knex from 'knex';
import { ILoggerCollection } from "../logger";
declare const knexProvider: (config: IConfig) => knex<any, unknown[]>;
export default knexProvider;
export { knexProvider };
export declare type DBConfig = knex.Config;
export declare type KnexInstance = knex;
interface IConfig {
    logger: ILoggerCollection;
    database: DBConfig;
}
