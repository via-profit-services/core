import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { Authentificator, AccountStatus } from '../../../authentificator';
import { buildCursorConnection, buildQueryFilter, IDirectionRange } from '../../../utils/generateCursorBundle';

export const AccountsQueries: IResolverObject<any, IContext, IListArgs> = {
  list: async (source, args, context) => {
    const authentificator = new Authentificator({ context });
    const knexBuilderFilter = buildQueryFilter(args);

    const cursorConnection = await authentificator.getAccounts(knexBuilderFilter);
    return buildCursorConnection(cursorConnection);
  },
};

interface IListArgs {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  status?: AccountStatus;
  orderBy?: {
    field: string;
    direction: IDirectionRange;
  };
}

export default AccountsQueries;
