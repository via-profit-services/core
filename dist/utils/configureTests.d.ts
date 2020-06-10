/// <reference types="ioredis" />
/// <reference types="ws" />
/// <reference types="session-file-store" />
/// <reference types="express" />
import { IInitProps } from '../types';
declare const configureTest: (config?: Partial<IInitProps>) => {
    config: {
        port?: number;
        endpoint?: string;
        subscriptionEndpoint?: string;
        timezone?: string;
        typeDefs?: import("graphql-tools").ITypedef[];
        middlewares?: import("graphql-middleware").IMiddlewareGenerator<any, Partial<import("../types").IContext>, any>[];
        resolvers?: import("graphql-tools").IResolvers<any, Partial<import("../types").IContext>>[];
        jwt: import("../schemas/auth/service").IJwtConfig;
        database: Pick<import("..").IDBConfig, "migrations" | "seeds" | "connection" | "timezone">;
        redis: import("ioredis").RedisOptions;
        logger: import("..").ILoggerCollection;
        routes?: {
            playground?: string;
            voyager?: string;
        };
        enableIntrospection?: boolean;
        usePlayground?: boolean;
        useVoyager?: boolean;
        serverOptions?: import("../types").IServerOptions;
        websocketOptions?: import("ws").ServerOptions;
        debug?: boolean;
        staticOptions?: import("../types").IStaticOptions;
        expressMiddlewares?: import("../types").IExpressMidlewareContainer[];
        sessions?: false | import("session-file-store").Options;
    };
    accessToken: import("../schemas/auth/service").ITokenInfo;
    refreshToken: import("../schemas/auth/service").ITokenInfo;
    app: import("express").Express;
    context: import("../types").IContext;
    schema: import("graphql").GraphQLSchema;
    routes: {
        playground?: string;
        voyager?: string;
    };
};
export default configureTest;
