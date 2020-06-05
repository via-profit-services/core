import Account from './Account';
import AccountsMutation from './AccountsMutation';
import AccountsQuery from './AccountsQuery';
import Subscription from './AccountsSubscription';

const resolvers = {
  Query: {
    accounts: () => ({}),
  },
  Mutation: {
    accounts: () => ({}),
  },
  Subscription,
  AccountsQuery,
  AccountsMutation,
  Account,
};

export default resolvers;
