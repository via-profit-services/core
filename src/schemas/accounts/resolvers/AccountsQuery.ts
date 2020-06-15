import { IResolverObject } from 'graphql-tools';

import { ServerError, UnauthorizedError } from '../../../errorHandlers';
import { IContext } from '../../../types';
import { buildCursorConnection, buildQueryFilter, TInputFilter } from '../../../utils/generateCursorBundle';
import createLoaders from '../loaders';
import AccountsService, { AccountStatus } from '../service';


export const accountsQueryResolver: IResolverObject<any, IContext> = {
  list: async (source, args: TInputFilter, context) => {
    const loaders = createLoaders(context);
    const filter = buildQueryFilter(args);
    const accountsService = new AccountsService({ context });

    try {
      const accountsConnection = await accountsService.getAccounts(filter);
      const connection = buildCursorConnection(accountsConnection, 'accounts');

      // fill the cache
      accountsConnection.nodes.forEach((node) => {
        loaders.accounts.clear(node.id).prime(node.id, node);
      });

      return connection;
    } catch (err) {
      throw new ServerError('Failed to get Accounts list', { err });
    }
  },
  statusesList: () => Object.values(AccountStatus),
  me: (parent, args, context) => {
    if (context.token.uuid === '') {
      throw new UnauthorizedError('Unknown account');
    }

    return { id: context.token.uuid };
  },
  account: (parent, args: {id: string}) => ({ id: args.id }),
};

export default accountsQueryResolver;
