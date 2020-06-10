import { Logger } from 'winston';
import 'winston-daily-rotate-file';
declare let logger: ILoggerCollection;
declare const configureLogger: (config: ILoggerConfig) => ILoggerCollection;
export interface ILoggerCollection {
    server: Logger;
    sql: Logger;
    auth: Logger;
    http: Logger;
    access: Logger;
    session: Logger;
    [key: string]: Logger;
}
export interface ILoggerConfig {
    logDir: string;
    loggers?: {
        [key: string]: Logger;
    };
}
export default configureLogger;
export { logger, configureLogger };
