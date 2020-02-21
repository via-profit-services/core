/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import { createServer, Server } from 'http';
import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import { mergeSchemas } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { authentificatorMiddleware, IJwtConfig } from '~/authentificator';
import { knexProvider, DBConfig, KnexInstance } from '~/databaseManager';

import { errorHandlerMiddleware, ILoggerCollection, requestHandlerMiddleware, ServerError } from '~/logger';
import { infoSchema } from '~/schemas';

class App {
  public props: IInitProps;

  public server: Server;

  public schema: GraphQLSchema;

  public routes: Partial<IInitProps['routes']>;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: 4000,
      endpoint: '/graphql',
      subscriptionsEndpoint: '/subscriptions',
      routes: {
        auth: '/auth',
        playground: '/playground',
        voyager: 'voyager',
      },
      usePlayground: false,
      useVoyager: false,
      ...props,
    } as IInitDefaultProps;
  }

  public static buildRoutes(endpoint: string, routes: Partial<IInitProps['routes']>): Partial<IInitProps['routes']> {
    return {
      auth: `${endpoint}/auth`,
      playground: `${endpoint}/playground`,
      voyager: `${endpoint}/voyager`,
      ...routes,
    };
  }

  public createApp() {
    const app = express();

    this.props.usePlayground = process.env.NODE_ENV === 'development' || !!this.props.usePlayground;

    this.props.useVoyager = process.env.NODE_ENV === 'development' || !!this.props.useVoyager;

    const {
      schemas,
      endpoint,
      port,
      jwt,
      database,
      logger,
      routes,
      subscriptionsEndpoint,
      usePlayground,
      useVoyager,
    } = this.props;

    // merge user schemas and legacy
    this.schema = mergeSchemas({ schemas: [...schemas, infoSchema] });

    // generate routes
    this.routes = App.buildRoutes(endpoint, routes);

    // define knex instance
    const knex = knexProvider({ logger, database });

    // define EventEmittre instance
    const emitter = new EventEmitter();

    // combine finally context object
    const context: IContext = {
      endpoint,
      jwt,
      logger,
      knex,
      emitter,
    };

    // Base middlewares
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request handler (request logger) middleware
    // This middleware must be defined first
    app.use(requestHandlerMiddleware({ context }));

    // authentification middleware
    app.use(
      authentificatorMiddleware({
        context,
        authUrl: this.routes.auth,
        allowedUrl: [this.routes.playground],
      }),
    );

    // GraphiQL playground middleware
    if (usePlayground) {
      app.get(this.routes.playground, expressPlayground({ endpoint }));
    }

    // GraohQL Voyager middleware
    if (useVoyager) {
      app.use(this.routes.voyager, voyagerMiddleware({ endpointUrl: endpoint }));
    }

    // GraphQL server
    app.use(
      endpoint,
      graphqlHTTP(
        async (): Promise<OptionsData & { subscriptionsEndpoint?: string }> => ({
          context,
          graphiql: false,
          schema: this.schema,
          subscriptionsEndpoint: `ws://localhost:${port}${subscriptionsEndpoint}`,
        }),
      ),
    );

    // Error handler middleware
    // This middleware most be defined first
    app.use(errorHandlerMiddleware({ context }));

    return {
      app,
      context,
      schema: this.schema,
      routes: this.routes,
    };
  }

  public createServer() {
    const { logger } = this.props;

    // Create web application by wrapping express app
    const { app, context } = this.createApp();

    // Create web server
    this.server = createServer(app);

    // configure knex query builder
    const { knex } = context;

    // check database connection
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

    return this.server;
  }

  public startServer() {
    const { port, subscriptionsEndpoint, usePlayground, useVoyager, endpoint } = this.props;

    // Run HTTP server
    this.server.listen(port, () => {
      // connect websockrt subscriptions werver
      // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
      // eslint-disable-next-line no-new
      new SubscriptionServer(
        {
          execute,
          schema: this.schema,
          subscribe,
        },
        {
          server: this.server,
          path: subscriptionsEndpoint,
        },
      );

      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);

      if (usePlayground) {
        console.log(
          `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(
            `http://localhost:${port}${this.routes.playground}`,
          )}`,
        );
      }
      console.log(
        `${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${this.routes.auth}`)}`,
      );
      if (useVoyager) {
        console.log(
          `${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${this.routes.voyager}`)}`,
        );
      }
      console.log('');
    });
  }
}

export default App;
export { App };

export interface IInitProps {
  port?: number;
  endpoint?: string;
  subscriptionsEndpoint?: string;
  schemas: GraphQLSchema[];
  jwt: IJwtConfig;
  database: DBConfig;
  logger: ILoggerCollection;
  routes?: {
    auth?: string;
    playground?: string;
    voyager?: string;
  };
  usePlayground?: boolean;
  useVoyager?: boolean;
}

interface IInitDefaultProps extends IInitProps {
  port: number;
  endpoint: string;
  subscriptionsEndpoint: string;
  routes: {
    auth: string;
    playground: string;
    voyager: string;
  };
  usePlayground: boolean;
  useVoyager: boolean;
}

export interface IContext {
  endpoint: string;
  jwt: IJwtConfig;
  knex: KnexInstance;
  logger: ILoggerCollection;
  emitter: EventEmitter;
}
