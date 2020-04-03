import chalk from 'chalk';
import { shield, or } from 'graphql-shield';
import { IContext } from '../../app';
import { ErrorHandler, ServerError } from '../../errorHandlers';
import {
  isAdmin,
  isAuthenticated,
  isDeveloper,
  isOwner,
} from '../../utils/permissions';

export const permissions = shield<any, IContext>({
  Account: {
    login: or(isDeveloper, isOwner, isAdmin),
    password: or(isDeveloper, isOwner, isAdmin),
  },
  AccessTokenPayload: or(isDeveloper, isOwner),
}, {
  fallbackRule: isAuthenticated,
  fallbackError: (err, parent, args, context: unknown, info) => {
    const { logger } = context as IContext;

    const {
      status, stack, name, message, metaData,
    } = (err || {
      status: 401,
      message: 'Permission denied',
      metaData: {
        action: 'GraphQL Shield protection',
        fieldNodes: info.fieldNodes,
      },
    }) as ErrorHandler;

    const errorMessage = message || 'Unknown error';

    switch (status) {
      case 401:
        logger.auth.error(errorMessage, {
          stack,
          metaData,
        });
        break;

      case 500:
      default:
        logger.server.error(errorMessage, {
          stack,
          metaData,
        });
        break;
    }


    if (process.env.NODE_ENV === 'development') {
      console.log('');
      console.log(`${chalk.red(errorMessage)} ${chalk.red(name)}`);
      console.log(chalk.yellow('Error metadata'), metaData);
      console.log('');
    }

    return new ServerError(errorMessage);
  },
});

export default permissions;
