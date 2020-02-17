import path from 'path';
import { configureLogger, Server } from '~/index';
import CatalogSchema, { configureCatalogLogger } from '~/playground/schemas/catalog';

const catalogLogger = configureCatalogLogger({
  logPath: 'log',
});

const logger = configureLogger({
  logPath: 'log',
  loggers: {
    catalog: catalogLogger,
  },
});

const server = new Server({
  database: {
    database: 'services',
    host: 'e1g.ru',
    password: 'nonprofitproject',
    username: 'services',
  },
  endpoint: '/api/graphql',
  jwt: {
    accessTokenExpiresIn: 1800,
    algorithm: 'RS256',
    issuer: 'viaprofit-services',
    privateKey: path.resolve(__dirname, './cert/jwtRS256.key'),
    publicKey: path.resolve(__dirname, './cert/jwtRS256.key.pub'),
    refreshTokenExpiresIn: 2.592e6,
  },
  logger,
  port: 4000,
  schemas: [CatalogSchema],
});

server.startServer();
// TODO Tests reuired
