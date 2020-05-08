/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Request, Response, NextFunction, ErrorRequestHandler,
} from 'express';

import { IContext } from '../types';
import customFormatErrorFn from './customFormatErrorFn';

interface IProps {
  context: IContext;
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
