import AuthMutationResolver from './AuthMutation';
// import AuthSubscriptionResolver from './AuthSubscription';

const resolvers = {
  Mutation: {
    auth: () => ({}),
  },
  // Subscription: AuthSubscriptionResolver,
  AuthMutation: AuthMutationResolver,
};

export default resolvers;
