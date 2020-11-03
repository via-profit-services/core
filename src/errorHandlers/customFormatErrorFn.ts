/* eslint-disable no-console */
import chalk from 'chalk';
import { GraphQLError } from 'graphql';

import { IContext } from '../types';
import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';
import ServerError from './ServerError';
import { ErrorHandler } from './types';
import UnauthorizedError from './UnauthorizedError';

type GraphQLErrorM = GraphQLError & {
  originalError: ErrorHandler;
}

export const customFormatErrorFn = (props: IProps) => {
  const { error, context, debug } = props;
  const { logger, token } = context;
  const { originalError } = error as GraphQLErrorM;
  const stack = error.stack.split('\n') || [];

  switch (true) {
    case originalError instanceof UnauthorizedError:
      logger.auth.error(originalError.message, {
        ...error, meta: originalError.metaData, token, stack,
      });
      break;

    case originalError instanceof ForbiddenError:
      logger.auth.error(originalError.message, {
        ...error, meta: originalError.metaData, token, stack,
      });
      logger.server.error(originalError.message, {
        ...error, meta: originalError.metaData, token, stack,
      });
      break;

    case originalError instanceof BadRequestError:
    case originalError instanceof NotFoundError:
    case originalError instanceof ServerError:
      logger.server.error(originalError.message, {
        ...error, meta: originalError.metaData, token, stack,
      });
      break;

    default:
      logger.server.error('Error', { ...error, token, stack });
      break;
  }

  if (debug) {
    console.log('');
    console.log(chalk.red('============== Caught the Error =============='));
    console.log('');

    if (originalError) {
      if (originalError.message) {
        console.log(chalk.red(originalError.message));
      }

      if (originalError.metaData) {
        console.log(chalk.yellow('Error metadata'), originalError.metaData);
      }
    }
    console.log(chalk.magenta('Access token payload'), token);
    console.log('');
    console.log(chalk.red(error.stack));
    console.log('');
    console.log(chalk.red('============== End of Error report =============='));
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
  context: IContext;
  debug: boolean;
}

export default customFormatErrorFn;
