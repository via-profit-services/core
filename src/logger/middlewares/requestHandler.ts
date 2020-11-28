import { NextFunction, Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';

import { IContext } from '../../types';

export default (config: ILoggerMiddlewareConfig) => {
  const { context } = config;
  const { logger } = context;

  return (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, headers } = req;

    const xForwardedFor = String(req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
    const ip = xForwardedFor || req.connection.remoteAddress;
    const ipAddress = ip === '127.0.0.1' || ip === '::1' ? 'localhost' : ip;

    const headersData: IncomingHttpHeaders = {};
    Object.entries(headers).forEach(([param, value]) => {
      if (param.toLowerCase() === 'authorization' && typeof value === 'string') {
        headersData[param] = `${value.substr(0, 35)}...[HIDDEN]`;

        return;
      }
      headersData[param] = value;
    });

    logger.http.info(`${ipAddress} ${method} "${originalUrl}"`, {
      headers: headersData,
    });

    return next();
  };
};

interface ILoggerMiddlewareConfig {
  context: IContext;
}
