/* eslint-disable import/max-dependencies */
import { createServer } from 'http';
import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { execute, GraphQLSchema, subscribe } from 'graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import { mergeSchemas } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { authentificatorMiddleware, IJwtConfig } from '~/authentificator';
import { knexProvider, DBConfig, KnexInstance } from '~/databaseManager';
import { errorHandlerMiddleware, ILoggerCollection, requestHandlerMiddleware, ServerError } from '~/logger';

const app = express();

class Server {
  private props: IInitProps;

  constructor(props: IInitProps) {
    this.props = props;
  }

  public async startServer() {
    const { schemas, endpoint, port, jwt, database, logger } = this.props;
    const subscriptionsEndpoint = '/subscriptions';
    const schema = mergeSchemas({ schemas });

    const routes = {
      auth: `${endpoint}/auth`,
      playground: `${endpoint}/playground`,
      voyager: `${endpoint}/voyager`,
    };

    const knex = knexProvider({ logger, database });

    // check connection
    knex
      .raw('SELECT 1+1 AS result')
      .then(() => {
        logger.server.debug('Test the connection by trying to authenticate is OK');
        return true;
      })
      .catch(err => {
        logger.server.error(err.name, err);
        throw new ServerError(err);
      });

    // const sequelize = sequelizeProvider({
    //   benchmark: true,
    //   logging: (sql, timing) => {
    //     if (process.env.NODE_ENV === 'development') {
    //       logger.sql.debug(sql, { queryTimeMs: timing });
    //     }
    //   },
    //   ...database,
    // });

    // sequelize
    //   .authenticate()
    //   .then(() => {
    //     logger.server.debug('Test the connection by trying to authenticate is OK');
    //     return true;
    //   })
    //   .catch(err => {
    //     logger.server.error(err.name, err);
    //     throw new ServerError(err);
    //   });

    const context: IContext = {
      endpoint,
      jwt,
      logger,
      knex,
    };
    // This middleware must be defined first
    app.use(requestHandlerMiddleware({ context }));
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    app.use(
      authentificatorMiddleware({
        context,
        authUrl: routes.auth,
        allowedUrl: [routes.playground],
      }),
    );
    app.get(routes.playground, expressPlayground({ endpoint }));
    app.use(routes.voyager, voyagerMiddleware({ endpointUrl: endpoint }));
    app.use(
      endpoint,
      graphqlHTTP(
        async (): Promise<OptionsData & { subscriptionsEndpoint?: string }> => ({
          context,
          graphiql: false,
          schema,
          subscriptionsEndpoint: `ws://localhost:${port}${subscriptionsEndpoint}`,
        }),
      ),
    );

    // this middleware most be defined first
    app.use(errorHandlerMiddleware({ context }));

    // Create listener server by wrapping express app
    const webServer = createServer(app);

    webServer.listen(port, () => {
      logger.server.debug('Server was started', { port, endpoint, routes });
      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
      console.log(
        `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
      );
      console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
      console.log(`${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`);
      console.log('');

      // Set up the WebSocket for handling GraphQL subscriptions.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ss = new SubscriptionServer(
        {
          execute,
          schema,
          subscribe,
        },
        {
          path: subscriptionsEndpoint,
          server: webServer,
        },
      );
    });

    process.on('SIGINT', code => {
      logger.server.debug(`Server was stopped (Ctrl-C key passed). Exit with code: ${code}`);
      process.exit(2);
    });
  }
}

interface IInitProps {
  port: number;
  endpoint: string;
  schemas: GraphQLSchema[];
  jwt: IJwtConfig;
  database: DBConfig;
  logger: ILoggerCollection;
}

export interface IContext {
  endpoint: string;
  jwt: IJwtConfig;
  knex: KnexInstance;
  logger: ILoggerCollection;
}

export { Server };
// TODO Tests reuired
