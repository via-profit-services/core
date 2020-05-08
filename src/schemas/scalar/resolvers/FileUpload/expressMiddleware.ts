import { Request, NextFunction } from 'express';
import processRequest from './processRequest';

import { TProcessRequest } from './types';

const graphqlUploadExpress = (props: Partial<TProcessRequest>) => {
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

    return processRequest(request, response, props)
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
  };
};

export default graphqlUploadExpress;
