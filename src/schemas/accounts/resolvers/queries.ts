import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { Authentificator } from '../../../authentificator';
import { buildCursorConnection, buildQueryFilter, TInputFilter } from '../../../utils/generateCursorBundle';

export const AccountsQuery: IResolverObject<any, IContext, TInputFilter> = {
  list: async (source, args, context) => {
    const authentificator = new Authentificator({ context });
    const knexBuilderFilter = buildQueryFilter(args);
    const cursorConnection = await authentificator.getAccounts(knexBuilderFilter);
    return buildCursorConnection(cursorConnection);
  },
};

export default AccountsQuery;
