import path from 'path';
import { configureLogger, IInitProps } from '~/index';
// import { configureCatalogLogger } from '~/playground/schemas/catalog';
import SimpleSchema from '~/playground/schemas/simple';

// const catalogLogger = configureCatalogLogger({
//   logPath: 'log',
// });

const logger = configureLogger({
  logPath: 'log',
  // loggers: {
  //   catalog: catalogLogger,
  // },
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
  subscriptionsEndpoint: '/api/subscriptions',
  jwt: jwtConfig,
  logger,
  port: 4000,
  schemas: [SimpleSchema],
};

export { serverConfig, jwtConfig, databaseConfig, logger };
