import AccountResolver from './Account';
import AccountsMutationResolver from './AccountsMutation';
import AccountsQueryResolver from './AccountsQuery';

const resolvers = {
  Query: {
    accounts: () => ({}),
  },
  Mutation: {
    accounts: () => ({}),
  },

  AccountsQuery: AccountsQueryResolver,
  AccountsMutation: AccountsMutationResolver,
  Account: AccountResolver,
};

export default resolvers;
