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


const serverConfig: IInitProps = {
  port: Number(process.env.PORT),
  logger: configureLogger({
    logDir: path.resolve(rootPath, process.env.LOG),
  }),
  database: {
    connection: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    migrations: {
      directory: path.resolve(rootPath, process.env.DB_MIGRATIONS_DIRECTORY),
      tableName: process.env.DB_MIGRATIONS_TABLENAME,
      extension: process.env.DB_MIGRATIONS_EXTENSION,
    },
    seeds: {
      directory: path.resolve(rootPath, process.env.DB_SEEDS_DIRECTORY),
      extension: process.env.DB_SEEDS_EXTENSION,
    },
    timezone: process.env.DB_TIMEZONE,
  },
  jwt: {
    accessTokenExpiresIn: Number(process.env.JWT_ACCESSTOKENEXPIRESIN),
    algorithm: process.env.JWT_ALGORITHM as IInitProps['jwt']['algorithm'],
    issuer: process.env.JWT_ISSUER,
    privateKey: path.resolve(rootPath, process.env.JWT_PRIVATEKEY),
    publicKey: path.resolve(rootPath, process.env.JWT_PUBLICKEY),
    refreshTokenExpiresIn: Number(process.env.JWT_REFRESHTOKENEXPIRESIN),
    blackList: path.resolve(rootPath, process.env.JWT_BLACKLIST),
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
