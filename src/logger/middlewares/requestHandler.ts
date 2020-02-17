import { NextFunction, Request, Response } from 'express';

import { IContext } from '~/index';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, headers } = req;

    const xForwardedFor = String(req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
    const ip = xForwardedFor || req.connection.remoteAddress;
    const ipAddress = ip === '127.0.0.1' || ip === '::1' ? 'localhost' : ip;

    logger.http.info(`${ipAddress} ${method} "${originalUrl}"`, { headers });
    return next();
  };
};

interface ILoggerMiddlewareConfig {
  context: IContext;
}
