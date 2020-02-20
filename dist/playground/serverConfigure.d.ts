import { IInitProps } from '~/index';
declare const logger: import("..").ILoggerCollection;
declare const databaseConfig: IInitProps['database'];
declare const jwtConfig: IInitProps['jwt'];
declare const serverConfig: IInitProps;
declare const configureApp: (config?: Partial<IInitProps>) => {
    app: import("express-serve-static-core").Express;
    context: import("..").IContext;
    schema: import("graphql").GraphQLSchema;
    routes: Partial<{
        auth?: string;
        playground?: string;
        voyager?: string;
    }>;
};
export { configureApp, serverConfig, jwtConfig, databaseConfig, logger };
export default configureApp;
