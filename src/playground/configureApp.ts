import path from 'path';
import dotenv from 'dotenv';
import { IInitProps } from '~/app';
import { configureLogger } from '~/logger';
import Catalogchema, { configureCatalogLogger } from '~/playground/schemas/catalog';
import SimpleSchema from '~/playground/schemas/simple';

const catalogLogger = configureCatalogLogger({
  logPath: 'log',
});

const logger = configureLogger({
  logPath: 'log',
  loggers: {
    catalog: catalogLogger,
  },
});

// dotenv configuration
dotenv.config();

const databaseConfig: IInitProps['database'] = {
  client: process.env.DB_CLIENT,
  connection: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
  },
};

const jwtConfig: IInitProps['jwt'] = {
  accessTokenExpiresIn: Number(process.env.JWT_ACCESSTOKENEXPIRESIN),
  algorithm: process.env.JWT_ALGORITHM,
  issuer: process.env.JWT_ISSUER,
  privateKey: path.resolve(__dirname, './cert/jwtRS256.key'),
  publicKey: path.resolve(__dirname, './cert/jwtRS256.key.pub'),
  refreshTokenExpiresIn: Number(process.env.JWT_REFRESHTOKENEXPIRESIN),
};

const serverConfig: IInitProps = {
  port: Number(process.env.PORT),
  endpoint: process.env.GQL_ENDPOINT,
  database: databaseConfig,
  jwt: jwtConfig,
  logger,
  schemas: [SimpleSchema, Catalogchema],
};

export { serverConfig, jwtConfig, databaseConfig, logger };
