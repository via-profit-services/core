/* eslint-disable no-console */
import { GraphQLError } from 'graphql';

import { Context } from '../types';
import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';
import ServerError from './ServerError';
import { ErrorHandler } from './types';

type GraphQLErrorM = GraphQLError & {
  originalError: ErrorHandler;
}

const customFormatErrorFn = (props: IProps) => {
  const { error, context, debug } = props;
  const { logger } = context;
  const { originalError } = error as GraphQLErrorM;
  const stack = error.stack.split('\n') || [];

  switch (true) {
    // case originalError instanceof UnauthorizedError:
    //   logger.auth.error(originalError.message, {
    //     ...error, meta: originalError.metaData, token, stack,
    //   });
    //   break;

    case originalError instanceof ForbiddenError:
      // logger.auth.error(originalError.message, {
      //   ...error, meta: originalError.metaData, stack,
      // });
      logger.server.error(originalError.message, {
        ...error, meta: originalError.metaData, stack,
      });
      break;

    case originalError instanceof BadRequestError:
    case originalError instanceof NotFoundError:
    case originalError instanceof ServerError:
      logger.server.error(originalError.message, {
        ...error, meta: originalError.metaData, stack,
      });
      break;

    default:
      logger.server.error('Error', { ...error, stack });
      break;
  }

  if (debug) {
    console.log('');
    console.log('============== Caught the Error ==============');
    console.log('');

    if (originalError) {
      if (originalError.message) {
        console.log(originalError.message);
      }

      if (originalError.metaData) {
        console.log('Error metadata', originalError.metaData);
      }
    }

    console.log('');
    console.log(error.stack);
    console.log('');
    console.log('============== End of Error report ==============');
    console.log('');

    return {
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split('\n') : [],
      path: error.path,
    };
  }

  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
  };
};

interface IProps {
  error: GraphQLError;
  context: Context;
  debug: boolean;
}

export default customFormatErrorFn;
