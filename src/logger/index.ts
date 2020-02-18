import { Logger } from 'winston';
import 'winston-daily-rotate-file';
import { authLogger, httpLogger, serverLogger, sqlLogger } from './loggers';

// eslint-disable-next-line import/no-mutable-exports
let logger: ILoggerCollection;

export const configureLogger = (config: ILoggerConfig) => {
  const { loggers, ...loggerConfig } = config;

  logger = {
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
  [key: string]: Logger;
}

export interface ILoggerConfig {
  logPath: string;
  loggers?: { [key: string]: Logger };
}

export { logger };
export * from './middlewares';
export * from './errorHandlers';
// TODO Tests reuired
