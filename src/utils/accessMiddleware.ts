import { NextFunction, Request, Response } from 'express';

import GateService from '../schemas/access/service';
import { IContext } from '../types';

export const accessMiddleware = (props: IProps) => async (
  req: Request, res: Response, next: NextFunction) => {
  const { context } = props;
  const { logger } = context;

  const gateService = new GateService({ context });
  const xForwardedFor = String(req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
  const ipAddress = xForwardedFor || req.connection.remoteAddress || 'unknown ip';
  const ipIsLocked = await gateService.isInBlackList(ipAddress);

  if (ipIsLocked) {
    logger.access.warn(
      `The ip address [${ipAddress}] is blacklisted. The request was blocked`, { ipAddress },
    );

    return res.json({ response: { status: 69 } }).end();
  }

  logger.access.info(`Request from [${ipAddress}]`, { ipAddress });

  return next();
};

interface IProps {
  context: IContext;
}

export default accessMiddleware;
