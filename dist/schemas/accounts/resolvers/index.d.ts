declare const resolvers: {
    Query: {
        accounts: () => {};
    };
    Mutation: {
        accounts: () => {};
    };
    Subscription: import("graphql-tools").IResolverObject<any, any, any>;
    AccountsQuery: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    AccountsMutation: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    Account: import("graphql-tools").IResolverObject<Pick<import("../../..").IAccount, "id">, import("../../..").IContext, any>;
};
export default resolvers;
