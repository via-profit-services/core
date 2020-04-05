import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

import {
  LOG_FILENAME_ERRORS, LOG_FILENAME_DEBUG, LOG_DATE_PATTERNT, LOG_MAZ_SIZE, LOG_MAZ_FILES,
} from '../../utils/constants';
import loggerFormatter from '../utils/logFormatter';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'debug',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_ERRORS}`,
        level: 'error',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAZ_SIZE,
        maxFiles: LOG_MAZ_FILES,
      }),
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_DEBUG}`,
        level: 'debug',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAZ_SIZE,
        maxFiles: LOG_MAZ_FILES,
      }),
    ],
  });
};

interface Config {
  logDir: string;
}
