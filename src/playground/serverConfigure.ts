import path from 'path';
import { configureLogger, IInitProps, createServer } from '~/index';
import NewsSchema from '~/playground/schemas/news';

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
  schemas: [NewsSchema],
};

const configureServer = (config?: Partial<IInitProps>) => {
  return createServer({ ...serverConfig, ...config });
};
export { configureServer, serverConfig, jwtConfig, databaseConfig, logger };
export default configureServer;
