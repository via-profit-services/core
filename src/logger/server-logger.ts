import type { LoggersConfig, Logger } from '@via-profit-services/core';
import Winston from 'winston';
import 'winston-daily-rotate-file';

import {
  LOG_FILENAME_ERRORS,
  LOG_FILENAME_DEBUG,
  LOG_FILENAME_WARNINGS,
  LOG_DATE_PATTERNT,
  LOG_MAX_SIZE,
  LOG_MAX_FILES,
} from '../constants';

import loggerFormatter from './log-formatter';


export default (config: LoggersConfig): Logger => {
  const { logDir } = config;
  const { createLogger, transports } = Winston;

  return createLogger({
    level: 'debug',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_WARNINGS}`,
        level: 'warn',
        datePattern: LOG_DATE_PATTERNT,
        zippedArchive: true,
        maxSize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES,
      }),
      new transports.DailyRotateFile({
        filename: `${logDir}/${LOG_FILENAME_ERRORS}`,
        level: 'error',
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

