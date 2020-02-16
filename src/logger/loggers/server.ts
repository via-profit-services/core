import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

import loggerFormatter from '../utils/logFormatter';

export default (config: Config) => {
  const { logPath } = config;

  return createLogger({
    level: 'debug',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logPath}/%DATE%-errors.log`,
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new transports.DailyRotateFile({
        filename: `${logPath}/%DATE%-debug.log`,
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
  logPath: string;
}
