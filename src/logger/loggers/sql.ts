import { transports, createLogger, format } from 'winston';
import 'winston-daily-rotate-file';

import {
  LOG_FILENAME_SQL, LOG_DATE_PATTERNT, LOG_MAX_SIZE, LOG_MAX_FILES,
} from '../../utils/constants';
import loggerFormatter from '../utils/logFormatter';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'debug',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_SQL}`,
        level: 'debug',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES,
      }),
      new transports.Console({
        level: 'error',
        format: format.combine(
          format.colorize({
            all: true,
          }),
          format.simple(),
        ),
      }),
    ],
  });
};

interface Config {
  logDir: string;
}
