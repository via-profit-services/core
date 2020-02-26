import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

import loggerFormatter from '../utils/logFormatter';
import { SQL_LOG_FILENAME } from '../utils/logNames';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'debug',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${SQL_LOG_FILENAME}`,
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new transports.Console({
        level: 'error',
      }),
    ],
  });
};

interface Config {
  logDir: string;
}
