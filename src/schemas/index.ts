import * as accounts from './accounts';
import commonTypeDefs from './common.graphql';
import * as info from './info';

const common = {
  typeDefs: commonTypeDefs,
};
export { accounts, info, common };
