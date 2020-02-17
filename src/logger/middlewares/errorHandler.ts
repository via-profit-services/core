import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

import { IContext } from '~/index';
import { ErrorHandler } from '~/logger/errorHandlers';
import responseFormatter from '~/logger/utils/responseFormatter';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
      const { status, stack, name, message, metaData } = err;
      const { originalUrl } = req;

      logger.server.error(message ? `${status || ''} ${message}` : 'Unknown error', { originalUrl, stack, metaData });

      if (process.env.NODE_ENV === 'development') {
        console.log('');
        console.log(`${chalk.bgRed.white(' Fatal Error ')} ${chalk.red(name)}`);
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
