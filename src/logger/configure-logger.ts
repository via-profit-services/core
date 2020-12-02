import type { LoggersConfig, LoggersCollection } from '@via-profit-services/core';
import Winston from 'winston';
import 'winston-daily-rotate-file';

import serverLogger from './server-logger';

const logger: LoggersCollection = null;
const configureLogger = (config: LoggersConfig) => {
  logger.server = serverLogger(config);

  return logger;
};

export { logger, Winston };
export default configureLogger;
