declare const resolvers: {
    Query: {
        accounts: () => {};
    };
    AccountsQuery: import("graphql-tools").IResolverObject<any, import("../../..").IContext, import("../../..").TInputFilter>;
};
export default resolvers;
