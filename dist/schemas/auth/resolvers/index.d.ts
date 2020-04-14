declare const resolvers: {
    Mutation: {
        auth: () => {};
    };
    Subscription: import("graphql-tools").IResolverObject<any, any, any>;
    AuthMutation: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
};
export default resolvers;
