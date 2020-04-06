import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { IAccount, Authentificator, AccountStatus } from '../../../authentificator';
import { ServerError } from '../../../errorHandlers';
import { DataLoader } from '../../../utils';
import { buildCursorConnection, buildQueryFilter, TInputFilter } from '../../../utils/generateCursorBundle';
import createDataloader from '../dataloader';

let dataloader: DataLoader<string, IAccount>;

export const accountsQueryResolver: IResolverObject<any, IContext> = {
  list: async (source, args: TInputFilter, context) => {
    dataloader = dataloader || createDataloader(context);
    const filter = buildQueryFilter(args);
    const autherntificator = new Authentificator({ context });

    try {
      const accountsConnection = await autherntificator.getAccounts(filter);
      const connection = buildCursorConnection(accountsConnection);

      // fill the cache
      accountsConnection.nodes.forEach((node) => {
        dataloader.clear(node.id).prime(node.id, node);
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
