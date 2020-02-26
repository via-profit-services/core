import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

import loggerFormatter from '../utils/logFormatter';
import { AUTH_LOG_FILENAME, DEBUG_LOG_FILENAME } from '../utils/logNames';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'info',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${AUTH_LOG_FILENAME}`,
        level: 'info',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new transports.DailyRotateFile({
        filename: `${logDir}/${DEBUG_LOG_FILENAME}`,
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });
};

interface Config {
  logDir: string;
}
