import AuthMutation from './AuthMutation';
import Subscription from './AuthSubscription';

const resolvers = {
  Mutation: {
    auth: () => ({}),
  },
  Subscription,
  AuthMutation,
};

export default resolvers;
