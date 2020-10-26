import Winston from 'winston';
import 'winston-daily-rotate-file';

import {
  authLogger, httpLogger, serverLogger, sqlLogger, sessionLogger, accessLogger,
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
    session: sessionLogger(loggerConfig),
    ...loggers,
  };

  return logger;
};

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
  loggers?: { [key: string]: Winston.Logger };
}

export default configureLogger;
export { logger, configureLogger, Winston };
