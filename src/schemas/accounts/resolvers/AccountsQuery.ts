import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { ServerError } from '../../../errorHandlers';
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
      const connection = buildCursorConnection(accountsConnection);

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
  me: (parent, args, context) => ({ id: context.token.uuid }),
  token: (parent, args, context) => {
    const { token } = context;
    return token;
  },
  account: (parent, args: {id: string}) => ({ id: args.id }),
};

export default accountsQueryResolver;
