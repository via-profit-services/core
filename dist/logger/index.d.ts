import { Logger } from 'winston';
import 'winston-daily-rotate-file';
declare let logger: ILoggerCollection;
export declare const configureLogger: (config: ILoggerConfig) => ILoggerCollection;
export interface ILoggerCollection {
    server: Logger;
    sql: Logger;
    auth: Logger;
    http: Logger;
    [key: string]: Logger;
}
export interface ILoggerConfig {
    logPath: string;
    loggers?: {
        [key: string]: Logger;
    };
}
export { logger };
export * from './middlewares';
export * from './errorHandlers';
