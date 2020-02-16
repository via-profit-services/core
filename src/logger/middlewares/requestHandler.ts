import { NextFunction, Request, Response } from 'express';

import { IContext } from '~/index';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, headers } = req;

    logger.http.info(`${method} "${originalUrl}"`, { headers });
    return next();
  };
};

interface ILoggerMiddlewareConfig {
  context: IContext;
}
