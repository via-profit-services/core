/* eslint-disable no-console */
import type { ErrorHandler, Context } from '@via-profit-services/core';
import { GraphQLError } from 'graphql';

import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';
import ServerError from './ServerError';

type GraphQLErrorM = GraphQLError & {
  originalError: ErrorHandler;
};

interface Props {
  error: GraphQLError;
  context: Context;
  debug: boolean;
}

const customFormatErrorFn = (props: Props) => {
  const { error, context, debug } = props;
  const { emitter } = context;
  const { originalError } = error as GraphQLErrorM;
  const stack = error.stack.split('\n') || [];

  switch (true) {
    case originalError instanceof ForbiddenError:
      emitter.emit('graphql-error', {
        message: originalError.message,
        stack,
        error,
      });

      break;

    case originalError instanceof BadRequestError:
    case originalError instanceof NotFoundError:
    case originalError instanceof ServerError:
      emitter.emit('graphql-error', {
        message: originalError.message,
        stack,
        error,
      });
      break;

    default:
      emitter.emit('graphql-error', {
        message: originalError.message,
        stack,
        error,
      });
      break;
  }

  if (debug) {
    console.log('');
    console.log('\x1b[31m%s\x1b[0m', '============== Caught the Error ==============');
    console.log('');

    if (originalError) {
      if (originalError.message) {
        console.log('\x1b[33m%s\x1b[0m', originalError.message);
      }

      if (originalError.metaData) {
        console.log('\x1b[33m%s\x1b[0m', 'Error metaData', originalError.metaData);
      }
    }

    console.log('');
    console.log('\x1b[33m%s\x1b[0m', error.stack);
    console.log('');
    console.log('\x1b[31m%s\x1b[0m', '============== End of Error report ==============');
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

export default customFormatErrorFn;
