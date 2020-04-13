import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { IInitProps } from '../app';
import { configureLogger } from '../logger';

// project root path
const rootPath = path.join(__dirname, '..', '..');

// dotenv configuration
dotenv.config({
  path: path.resolve(rootPath, '.env'),
});

const logger = configureLogger({
  logDir: path.resolve(rootPath, process.env.LOG),
});

const databaseConfig: IInitProps['database'] = {
  connection: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
  },
  timezone: process.env.DB_TIMEZONE,
  migrations: {
    directory: path.resolve(rootPath, process.env.DB_MIGRATIONS_DIRECTORY),
    tableName: process.env.DB_MIGRATIONS_TABLENAME,
    extension: process.env.DB_MIGRATIONS_EXTENSION,
  },
  seeds: {
    directory: path.resolve(rootPath, process.env.DB_SEEDS_DIRECTORY),
    extension: process.env.DB_SEEDS_EXTENSION,
  },
};

const jwtConfig: IInitProps['jwt'] = {
  accessTokenExpiresIn: Number(process.env.JWT_ACCESSTOKENEXPIRESIN),
  algorithm: process.env.JWT_ALGORITHM as IInitProps['jwt']['algorithm'],
  issuer: process.env.JWT_ISSUER,
  privateKey: path.resolve(rootPath, process.env.JWT_PRIVATEKEY),
  publicKey: path.resolve(rootPath, process.env.JWT_PUBLICKEY),
  refreshTokenExpiresIn: Number(process.env.JWT_REFRESHTOKENEXPIRESIN),
  blackList: path.resolve(rootPath, process.env.JWT_BLACKLIST),
};

const serverConfig: IInitProps = {
  port: Number(process.env.PORT),
  endpoint: process.env.GQL_ENDPOINT,
  subscriptionEndpoint: process.env.GQL_SUBSCRIPTIONENDPOINT,
  timezone: process.env.TIMEZONE,
  database: databaseConfig,
  jwt: jwtConfig,
  logger,
  serverOptions: {
    // key: fs.readFileSync(path.resolve(rootPath, process.env.SSL_KEY)),
    // cert: fs.readFileSync(path.resolve(rootPath, process.env.SSL_CERT)),
    cookieSign: process.env.COOKIES_SIGN_SECRET,
  },
};

const configureApp = (props?: IProps): IInitProps => {
  const { typeDefs, resolvers } = props || {};
  return {
    ...serverConfig,
    typeDefs,
    resolvers,
  };
};

interface IProps {
  typeDefs?: IInitProps['typeDefs'];
  resolvers?: IInitProps['resolvers'];
}

export default configureApp;
export { configureApp };
