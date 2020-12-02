import type { Context } from '@via-profit-services/core';
import type { Request, Response, NextFunction } from 'express';

import customFormatErrorFn from './customFormatErrorFn';

interface IProps {
  context: Context;
}

const accessMiddleware = (props: IProps) => (
  error: any,
  _req: Request,
  _res: Response,
  _next: NextFunction,
) => {
  const { context } = props;

  customFormatErrorFn({
    context,
    error,
    debug: process.env.NODE_ENV === 'development',
  });
};

export default accessMiddleware;
