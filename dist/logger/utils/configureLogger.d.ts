import Winston from 'winston';
import 'winston-daily-rotate-file';
declare let logger: ILoggerCollection;
declare const configureLogger: (config: ILoggerConfig) => ILoggerCollection;
export interface ILoggerCollection {
    server: Winston.Logger;
    sql: Winston.Logger;
    auth: Winston.Logger;
    http: Winston.Logger;
    access: Winston.Logger;
    session: Winston.Logger;
    [key: string]: Winston.Logger;
}
export interface ILoggerConfig {
    logDir: string;
    loggers?: {
        [key: string]: Winston.Logger;
    };
}
export default configureLogger;
export { logger, configureLogger, Winston };
