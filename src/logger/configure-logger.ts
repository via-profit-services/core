import Winston from 'winston';
import 'winston-daily-rotate-file';

import { LoggersConfig, LoggersCollection } from '../types';
import serverLogger from './server-logger';

// eslint-disable-next-line import/no-mutable-exports
let logger: LoggersCollection;


const configureLogger = (config: LoggersConfig) => {
  logger = {
    server: serverLogger(config),
  };

  return logger;
};

export { logger, configureLogger, Winston };