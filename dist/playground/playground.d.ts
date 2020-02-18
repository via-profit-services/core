import { IInitProps } from '~/index';
declare const logger: import("..").ILoggerCollection;
declare const databaseConfig: IInitProps['database'];
declare const jwtConfig: IInitProps['jwt'];
declare const serverConfig: IInitProps;
declare const server: import("express-serve-static-core").Express;
export default server;
export { serverConfig, jwtConfig, databaseConfig, logger };
