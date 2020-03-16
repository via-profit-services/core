import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';
import { IContext } from '../../app';
import { ErrorHandler } from '../../errorHandlers';
import responseFormatter from '../utils/responseFormatter';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
      const { status, stack, name, message, metaData } = err;
      const { originalUrl } = req;

      const errorMessage = message ? `${status || ''} ${message}` : 'Unknown error';

      switch (status) {
        case 401:
          logger.auth.error(errorMessage, {
            originalUrl,
            stack,
            metaData,
          });
          break;

        case 500:
        default:
          logger.server.error(errorMessage, {
            originalUrl,
            stack,
            metaData,
          });
          break;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('');
        console.log(`${chalk.bgRed.white(errorMessage)} ${chalk.red(name)}`);
        console.log(message, metaData);
        console.log('');
      }

      res.status(status || 500).json(
        responseFormatter({
          message: message || 'Please contact system administrator',
          name: name || 'Internal server error',
        }),
      );
    },
    (req: Request, res: Response) => {
      res.status(404).end();
    },
    (req: Request, res: Response) => {
      res.status(503).end();
    },
    (req: Request, res: Response) => {
      res.status(400).end();
    },
  ];
};

interface ILoggerMiddlewareConfig {
  context: IContext;
}
