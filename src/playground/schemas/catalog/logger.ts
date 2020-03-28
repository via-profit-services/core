import { transports, createLogger, format } from 'winston';
import 'winston-daily-rotate-file';

export default (config: Config) => {
  const { logDir } = config;

  return createLogger({
    level: 'debug',
    format: format.combine(
      format.metadata(),
      format.json(),
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZZ' }),
      format.splat(),
      format.printf((info) => {
        const {
          timestamp, level, message, metadata,
        } = info;
        const meta = JSON.stringify(metadata) !== '{}' ? metadata : null;

        return `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
      }),
    ),
    transports: [
      new transports.DailyRotateFile({
        filename: `${logDir}/catalog-%DATE%-.log`,
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
