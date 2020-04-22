declare const resolvers: {
    Query: {
        accounts: () => {};
    };
    Mutation: {
        accounts: () => {};
    };
    AccountsQuery: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    AccountsMutation: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
    Account: import("graphql-tools").IResolverObject<Pick<import("../service").IAccount, "id">, import("../../..").IContext, any>;
};
export default resolvers;
