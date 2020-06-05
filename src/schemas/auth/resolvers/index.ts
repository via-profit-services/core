import AccessTokenPayload from './AccessTokenPayload';
import AuthMutation from './AuthMutation';
import AuthQuery from './AuthQuery';
import Subscription from './AuthSubscription';
import RefreshTokenPayload from './RefreshTokenPayload';

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
  RefreshTokenPayload,
};

export default resolvers;
