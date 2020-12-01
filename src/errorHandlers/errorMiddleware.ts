/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Request, Response, NextFunction,
} from 'express';

import { Context } from '../types';
import customFormatErrorFn from './customFormatErrorFn';

interface IProps {
  context: Context;
}

const accessMiddleware = (props: IProps) => (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { context } = props;

  customFormatErrorFn({
    context,
    error,
    debug: process.env.NODE_ENV === 'development',
  });
};

export default accessMiddleware;
