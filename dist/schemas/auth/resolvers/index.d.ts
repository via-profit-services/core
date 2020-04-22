declare const resolvers: {
    Mutation: {
        auth: () => {};
    };
    AuthMutation: import("graphql-tools").IResolverObject<any, import("../../..").IContext, any>;
};
export default resolvers;
