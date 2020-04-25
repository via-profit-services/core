import AccountResolver from './Account';
import AccountsMutationResolver from './AccountsMutation';
import AccountsQueryResolver from './AccountsQuery';
import AccountsSubscriptionResolver from './AccountsSubscription';

const resolvers = {
  Query: {
    accounts: () => ({}),
  },
  Mutation: {
    accounts: () => ({}),
  },
  Subscription: AccountsSubscriptionResolver,
  AccountsQuery: AccountsQueryResolver,
  AccountsMutation: AccountsMutationResolver,
  Account: AccountResolver,
};

export default resolvers;
