import { Logger } from 'winston';
import 'winston-daily-rotate-file';
import {
  authLogger, httpLogger, serverLogger, sqlLogger, accessLogger,
} from '../loggers';

// eslint-disable-next-line import/no-mutable-exports
let logger: ILoggerCollection;

const configureLogger = (config: ILoggerConfig) => {
  const { loggers, ...loggerConfig } = config;

  logger = {
    access: accessLogger(loggerConfig),
    auth: authLogger(loggerConfig),
    http: httpLogger(loggerConfig),
    server: serverLogger(loggerConfig),
    sql: sqlLogger(loggerConfig),
    ...loggers,
  };

  return logger;
};

export interface ILoggerCollection {
  server: Logger;
  sql: Logger;
  auth: Logger;
  http: Logger;
  access: Logger;
  [key: string]: Logger;
}

export interface ILoggerConfig {
  logDir: string;
  loggers?: { [key: string]: Logger };
}

export default configureLogger;
export { logger, configureLogger };
