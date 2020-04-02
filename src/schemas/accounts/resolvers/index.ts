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
  Account: AccountResolver,
  AccountsQuery: AccountsQueryResolver,
  AccountsMutation: AccountsMutationResolver,
};

export default resolvers;
