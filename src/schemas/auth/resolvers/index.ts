import AccessTokenPayload from './AccessTokenPayload';
import AuthMutation from './AuthMutation';
import AuthQuery from './AuthQuery';
import Subscription from './AuthSubscription';

const resolvers = {
  Mutation: {
    auth: () => ({}),
  },
  Query: {
    auth: () => ({}),
  },
  Subscription,
  AuthMutation,
  AuthQuery,
  AccessTokenPayload,
};

export default resolvers;
