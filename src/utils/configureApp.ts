import path from 'path';
import dotenv from 'dotenv';
import { IInitProps } from '~/app';
import { configureLogger } from '~/logger';

const logger = configureLogger({
  logPath: 'log',
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
  privateKey: path.resolve(process.cwd(), './src/playground/cert/jwtRS256.key'),
  publicKey: path.resolve(process.cwd(), './src/playground/cert/jwtRS256.key.pub'),
  refreshTokenExpiresIn: Number(process.env.JWT_REFRESHTOKENEXPIRESIN),
};

const serverConfig: IInitProps = {
  port: Number(process.env.PORT),
  endpoint: process.env.GQL_ENDPOINT,
  database: databaseConfig,
  jwt: jwtConfig,
  logger,
  schemas: [],
};

const configureApp = (props: IProps): IInitProps => {
  const { schemas } = props;
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
