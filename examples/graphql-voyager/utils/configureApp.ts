import path from 'path';
import { IInitProps, configureLogger, Express } from '@via-profit-services/core';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';

const configureApp = (props?: Partial<IInitProps>): IInitProps => {
  return {
    enableIntrospection: true,
    expressMiddlewares: [
      ({ context }) => {
        const router = Express.Router();
        router.use('/voyager', voyagerMiddleware({ endpointUrl: context.endpoint }))

        return router;
      },
    ],
    port: 9000,
    logger: configureLogger({
      logDir: path.resolve(__dirname, '../log'),
    }),
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
    },
    database: {
      connection: {
        host: 'localhost',
        user: 'services',
        database: 'services_core',
        password: 'admin',
      },
      migrations: {
        directory: path.resolve(__dirname, '../database/migrations'),
        tableName: 'knex_migrations',
        extension: 'ts',
      },
      seeds: {
        directory: path.resolve(__dirname, '../database/seeds'),
        extension: process.env.DB_SEEDS_EXTENSION,
      },
      timezone: 'UTC',
    },
    jwt: {
      accessTokenExpiresIn: 1800,
      refreshTokenExpiresIn: 2.592e6,
      algorithm: 'RS256',
      issuer: process.env.JWT_ISSUER,
      privateKey: path.resolve(__dirname, '../keys/jwtRS256.key'),
      publicKey: path.resolve(__dirname, '../keys/jwtRS256.key.pub'),
    },
    ...props,
  };
};

export default configureApp;