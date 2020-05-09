import { Request, NextFunction } from 'express';
import customFormatErrorFn from '../../../../errorHandlers/customFormatErrorFn';
import { IContext } from '../../../../types';
import processRequest from './processRequest';

import { TProcessRequest } from './types';

const graphqlUploadExpress = (context: IContext, props: Partial<TProcessRequest>) => {
  return (request: Request, response: any, next: NextFunction) => {
    if (!request.is('multipart/form-data')) {
      return next();
    }

    const finished = new Promise((resolve) => request.on('end', resolve));
    const { send } = response;

    response.send = (...args: any[]) => {
      finished.then(() => {
        response.send = send;
        response.send(...args);
      });
    };

    try {
      const result = processRequest(request, response, props)
        .then((body) => {
          request.body = body;
          next();
        })
        .catch((error) => {
          if (error.status && error.expose) {
            response.status(error.status);
          }

          next(error);
        });

      return result;
    } catch (error) {
      return customFormatErrorFn({
        context,
        error,
        debug: process.env.NODE_ENV === 'development',
      });
    }
  };
};

export default graphqlUploadExpress;
