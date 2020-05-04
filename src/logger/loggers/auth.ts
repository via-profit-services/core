import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

import {
  LOG_FILENAME_AUTH, LOG_FILENAME_DEBUG, LOG_DATE_PATTERNT, LOG_MAX_SIZE, LOG_MAX_FILES,
} from '../../utils/constants';
import loggerFormatter from '../utils/logFormatter';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'info',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_AUTH}`,
        level: 'info',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES,
      }),
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_DEBUG}`,
        level: 'debug',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES,
      }),
    ],
  });
};

interface Config {
  logDir: string;
}
