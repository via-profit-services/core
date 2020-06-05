declare const resolvers: {
    Mutation: {
        auth: () => {};
    };
    Query: {
        auth: () => {};
    };
    Subscription: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    AuthMutation: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    AuthQuery: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    AccessTokenPayload: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
};
export default resolvers;
