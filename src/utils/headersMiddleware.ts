import { NextFunction, Request, Response } from 'express';

export const headersMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Developer', 'Via Profit');

    next();
  };
};

export default headersMiddleware;
