import { IInitProps } from '~/index';
declare const logger: import("..").ILoggerCollection;
declare const databaseConfig: IInitProps['database'];
declare const jwtConfig: IInitProps['jwt'];
declare const serverConfig: IInitProps;
export { serverConfig, jwtConfig, databaseConfig, logger };