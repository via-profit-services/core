import { IResolverObject } from 'graphql-tools';
import { IContext } from '~/app';
import { Authentificator, IAccountsFilter, OrderRange, AccountStatus } from '~/authentificator';
import { buildCursorBundle, cursorToString } from '~/utils/generateCursorBundle';

export const AccountsQueries: IResolverObject<any, IContext, IListArgs> = {
  list: async (_, args, context) => {
    const { first, last, after, before, orderBy, status } = args;
    const authentificator = new Authentificator({ context });

    // combine filter
    const filter: IAccountsFilter = {
      limit: first !== undefined ? first : last,
      orderBy: [
        {
          column: 'cursor',
          order: after !== undefined ? OrderRange.asc : OrderRange.desc,
        },
      ],
      where: {},
    };

    if (after !== undefined) {
      filter.after = Number(cursorToString(after));
    }

    if (before !== undefined) {
      filter.before = Number(cursorToString(before));
    }

    if (orderBy !== undefined) {
      filter.orderBy.unshift({ column: orderBy.field, order: orderBy.direction });
    }

    if (status !== undefined) {
      filter.where.status = status;
    }

    const accountsList = await authentificator.getAccounts(filter);
    const { totalCount, nodes } = accountsList;

    const res = buildCursorBundle({
      nodes,
      totalCount,
      limit: filter.limit,
    });
    return res;
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
    direction: OrderRange;
  };
}

export default AccountsQueries;
