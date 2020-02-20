import { IInitProps } from '~/index';
declare const configureTest: (config?: Partial<IInitProps>) => {
    config: {
        port: number;
        endpoint: string;
        subscriptionsEndpoint: string;
        schemas: import("graphql").GraphQLSchema[];
        jwt: import("..").IJwtConfig;
        database: import("..").DBConfig;
        logger: import("..").ILoggerCollection;
        routes?: {
            auth?: string;
            playground?: string;
            voyager?: string;
        };
    };
    accessToken: import("..").ITokenInfo;
    refreshToken: import("..").ITokenInfo;
    app: import("express-serve-static-core").Express;
    context: import("..").IContext;
    schema: import("graphql").GraphQLSchema;
    routes: Partial<{
        auth?: string;
        playground?: string;
        voyager?: string;
    }>;
};
export default configureTest;
