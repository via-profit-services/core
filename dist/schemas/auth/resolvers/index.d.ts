declare const resolvers: {
    Mutation: {
        auth: () => {};
    };
    Subscription: import("@graphql-tools/utils").IObjectTypeResolver<any, import("../../..").IContext, any>;
    AuthMutation: import("@graphql-tools/utils").IObjectTypeResolver<any, import("../../..").IContext, any>;
};
export default resolvers;
