/// <reference types="ioredis" />
/// <reference types="ws" />
/// <reference types="session-file-store" />
/// <reference types="express" />
import { IInitProps } from '../types';
declare const configureTest: (config?: Partial<IInitProps>) => {
    config: {
        port?: number;
        authEndpoint?: string;
        endpoint?: string;
        subscriptionEndpoint?: string;
        timezone?: string;
        typeDefs?: import("@graphql-tools/utils/Interfaces").ITypedef[];
        middlewares?: import("graphql-middleware").IMiddleware<any, import("../types").IContext, any>[];
        resolvers?: Record<string, import("@graphql-tools/utils/Interfaces").IUnionTypeResolver | import("@graphql-tools/utils/Interfaces").IScalarTypeResolver | import("@graphql-tools/utils/Interfaces").IEnumTypeResolver | import("@graphql-tools/utils/Interfaces").IInputObjectTypeResolver | import("@graphql-tools/utils/Interfaces").IFieldResolver<any, Partial<import("../types").IContext>, Record<string, any>, any> | import("@graphql-tools/utils/Interfaces").IObjectTypeResolver<any, Partial<import("../types").IContext>, any> | import("@graphql-tools/utils/Interfaces").IInterfaceTypeResolver<any, Partial<import("../types").IContext>, any>>[];
        jwt: import("../schemas/auth").IJwtConfig;
        database: Pick<import("..").IDBConfig, "migrations" | "seeds" | "connection" | "timezone" | "pool">;
        redis: import("ioredis").RedisOptions;
        logger: import("..").ILoggerCollection;
        routes?: {
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
    accessToken: import("../schemas/auth").ITokenInfo;
    refreshToken: import("../schemas/auth").ITokenInfo;
    app: import("express").Express;
    context: import("../types").IContext;
    schema: import("graphql").GraphQLSchema;
    routes: {
        voyager?: string;
    };
};
export default configureTest;
