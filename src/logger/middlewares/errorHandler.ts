import { Request, Response } from 'express';

import { IContext } from '~/index';
import { ErrorHandler } from '~/logger/errorHandlers';
import responseFormatter from '~/logger/utils/responseFormatter';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return [
    (err: ErrorHandler, req: Request, res: Response) => {
      const { status, stack, name, message, metaData } = err;
      const { originalUrl } = req;

      logger.server.error(
        message ? `${status || ''} ${message}` : 'Unknown error',
        { originalUrl, stack, metaData },
      );

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
