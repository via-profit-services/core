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
    AccessTokenPayload: import("graphql-tools").IResolverObject<{
        type: import("../service").TokenType.access;
        id: string;
        uuid: string;
        roles: string[];
        exp: number;
        iss: string;
    }, import("../../..").IContext, any>;
    RefreshTokenPayload: import("graphql-tools").IResolverObject<Pick<{
        type: import("../service").TokenType.access;
        id: string;
        uuid: string;
        roles: string[];
        exp: number;
        iss: string;
    }, "id" | "roles" | "uuid" | "exp" | "iss"> & {
        type: import("../service").TokenType.refresh;
        associated: string;
    }, import("../../..").IContext, any>;
};
export default resolvers;
