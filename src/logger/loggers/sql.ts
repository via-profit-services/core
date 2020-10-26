import {
  LOG_FILENAME_SQL, LOG_DATE_PATTERNT, LOG_MAX_SIZE, LOG_MAX_FILES,
} from '../../utils/constants';
import { Winston } from '../utils/configureLogger';

import loggerFormatter from '../utils/logFormatter';

const { createLogger, transports, format } = Winston;

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
