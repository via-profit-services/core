import { IInitProps } from '~/app';
declare const configureTest: (config?: Partial<IInitProps>) => {
    config: {
        port: number;
        endpoint?: string;
        subscriptionsEndpoint?: string;
        schemas: import("graphql").GraphQLSchema[];
        jwt: import("../authentificator").IJwtConfig;
        database: import("../databaseManager").DBConfig;
        logger: import("../logger").ILoggerCollection;
        routes?: {
            auth?: string;
            playground?: string;
            voyager?: string;
        };
        usePlayground?: boolean;
        useVoyager?: boolean;
    };
    accessToken: import("../authentificator").ITokenInfo;
    refreshToken: import("../authentificator").ITokenInfo;
    app: import("express-serve-static-core").Express;
    context: import("../app").IContext;
    schema: import("graphql").GraphQLSchema;
    routes: {
        auth: string;
        playground: string;
        voyager: string;
    };
};
export default configureTest;
