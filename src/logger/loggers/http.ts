import { transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';
import loggerFormatter from '../utils/logFormatter';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'info',
    format: loggerFormatter,
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/%DATE%-http.log`,
        level: 'info',
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
