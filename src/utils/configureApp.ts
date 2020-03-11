import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { IInitProps } from '../app';
import { configureLogger } from '../logger';

const logger = configureLogger({
  logDir: 'log',
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
  migrations: {
    directory: process.env.DB_MIGRATIONS_DIRECTORY,
    tableName: process.env.DB_MIGRATIONS_TABLENAME,
    extension: process.env.DB_MIGRATIONS_EXTENSION,
  },
};

const jwtConfig: IInitProps['jwt'] = {
  accessTokenExpiresIn: Number(process.env.JWT_ACCESSTOKENEXPIRESIN),
  algorithm: process.env.JWT_ALGORITHM as IInitProps['jwt']['algorithm'],
  issuer: process.env.JWT_ISSUER,
  privateKey: path.resolve(process.cwd(), process.env.JWT_PRIVATEKEY),
  publicKey: path.resolve(process.cwd(), process.env.JWT_PUBLICKEY),
  refreshTokenExpiresIn: Number(process.env.JWT_REFRESHTOKENEXPIRESIN),
};

const serverConfig: IInitProps = {
  port: Number(process.env.PORT),
  endpoint: process.env.GQL_ENDPOINT,
  subscriptionsEndpoint: process.env.GQL_SUBSCRIPTIONSENDPOINT,
  timezone: process.env.TIMEZONE,
  database: databaseConfig,
  jwt: jwtConfig,
  logger,
  schemas: [],
  serverOptions: {
    key: fs.readFileSync(path.resolve(process.env.SSL_KEY)),
    cert: fs.readFileSync(path.resolve(process.env.SSL_CERT)),
  },
};

const configureApp = (props?: IProps): IInitProps => {
  const { schemas } = props || {};
  return {
    ...serverConfig,
    schemas,
  };
};

interface IProps {
  schemas: IInitProps['schemas'];
}

export default configureApp;
export { configureApp };
