import path from 'path';
import { configureLogger, IInitProps, createApp } from '~/index';
import SimpleSchema from '~/playground/schemas/simple';

const logger = configureLogger({
  logPath: 'log',
});

const databaseConfig: IInitProps['database'] = {
  client: 'pg',
  connection: {
    database: 'services',
    host: 'e1g.ru',
    password: 'nonprofitproject',
    user: 'services',
  },
};

const jwtConfig: IInitProps['jwt'] = {
  accessTokenExpiresIn: 1800,
  algorithm: 'RS256',
  issuer: 'viaprofit-services',
  privateKey: path.resolve(__dirname, './cert/jwtRS256.key'),
  publicKey: path.resolve(__dirname, './cert/jwtRS256.key.pub'),
  refreshTokenExpiresIn: 2.592e6,
};

const serverConfig: IInitProps = {
  database: databaseConfig,
  endpoint: '/api/graphql',
  jwt: jwtConfig,
  logger,
  port: 4000,
  schemas: [SimpleSchema],
};

const configureApp = (config?: Partial<IInitProps>) => {
  return createApp({ ...serverConfig, ...config });
};
export { configureApp, serverConfig, jwtConfig, databaseConfig, logger };
export default configureApp;
