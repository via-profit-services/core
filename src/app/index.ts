/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import { createServer, Server, ServerOptions } from 'https';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import { mergeSchemas } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { IJwtConfig } from '../authentificator/authentificator';
import { authentificatorMiddleware } from '../authentificator/authentificatorMiddleware';
import { knexProvider, IDBConfig, KnexInstance } from '../databaseManager';
import { errorHandlerMiddleware, requestHandlerMiddleware, ILoggerCollection } from '../logger';
import { accountsSchema } from '../schemas';
import {
  // AUTHORIZATION_KEY,
  // ACCESS_TOKEN_BEARER,
  DEFAULT_SERVER_PORT,
  DEFAULT_GRAPHQL_ENDPOINT,
  DEFAULT_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_ROUTE_AUTH,
  DEFAULT_ROUTE_PLAYGROUND,
  DEFAULT_ROUTE_VOYAGER,
  MAXIMUM_REQUEST_BODY_SIZE,
} from '../utils';
import { configureTokens } from '../utils/configureTokens';
import { CronJobManager } from '../utils/cronJobManager';
import { headersMiddleware } from '../utils/headersMiddleware';

class App {
  public props: IInitDefaultProps;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: DEFAULT_SERVER_PORT,
      endpoint: DEFAULT_GRAPHQL_ENDPOINT,
      timezone: DEFAULT_SERVER_TIMEZONE,
      subscriptionsEndpoint: DEFAULT_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
      usePlayground: process.env.NODE_ENV === 'development',
      useVoyager: process.env.NODE_ENV === 'development',
      ...props,
    } as IInitDefaultProps;

    // combine default routes with passed
    this.props.routes = {
      auth: DEFAULT_ROUTE_AUTH,
      playground: DEFAULT_ROUTE_PLAYGROUND,
      voyager: DEFAULT_ROUTE_VOYAGER,
      ...this.props.routes,
    } as IInitDefaultProps['routes'];
  }

  public bootstrap(callback?: (args: IBootstrapCallbackArgs) => void) {
    const { port, usePlayground, useVoyager, endpoint, routes, serverOptions } = this.props;
    const { app, schema, context } = this.createApp();
    const { logger } = context;
    const server = createServer(serverOptions, app);

    // Run HTTP server
    server.listen(port, () => {
      // set resolver URL's list
      const resolveUrl: IBootstrapCallbackArgs['resolveUrl'] = {
        graphql: `https://localhost:${port}${endpoint}`,
        auth: `https://localhost:${port}${routes.auth}`,
      };

      if (usePlayground) {
        resolveUrl.playground = `https://localhost:${port}${routes.playground}`;
      }

      if (useVoyager) {
        resolveUrl.voyager = `https://localhost:${port}${routes.voyager}`;
      }

      // log
      logger.server.debug(`App server started at «${resolveUrl.graphql}»`);

      // connect websockrt subscriptions werver
      this.createSubscriptionServer({ schema, server });

      if (callback !== undefined) {
        callback({
          port,
          context,
          resolveUrl,
        });
      }
    });
  }

  public createSubscriptionServer(config: ISubServerConfig) {
    const { subscriptionsEndpoint } = this.props;
    const { server, schema } = config;

    // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
    return new SubscriptionServer(
      {
        execute,
        schema,
        subscribe,
      },
      {
        server,
        path: subscriptionsEndpoint,
      },
    );
  }

  public createApp() {
    const {
      schemas,
      endpoint,
      timezone,
      port,
      jwt,
      database,
      logger,
      routes,
      subscriptionsEndpoint,
      usePlayground,
      useVoyager,
      serverOptions,
    } = this.props as IInitDefaultProps;

    const { cookieSign } = serverOptions;

    logger.server.debug('Create application proc was started');

    // init main server handle
    const app = express();

    // merge user schemas and legacy
    const schema = mergeSchemas({ schemas: [...schemas, accountsSchema] });

    // define knex instance
    const knex = knexProvider({
      localTimezone: timezone,
      logger,
      ...database,
    });

    // define EventEmittre instance
    const emitter = new EventEmitter();

    // configure cron job manager
    CronJobManager.configure({ logger });

    // combine finally context object
    const context: IContext = {
      endpoint,
      timezone,
      jwt,
      logger,
      knex,
      emitter,
    };

    app.use(
      cors({
        credentials: true,
        origin: (origin, callback) => {
          return callback(null, true);
        },
      }),
    );
    app.use(express.json({ limit: MAXIMUM_REQUEST_BODY_SIZE }));
    app.use(express.urlencoded({ extended: true, limit: MAXIMUM_REQUEST_BODY_SIZE }));
    app.use(cookieParser(cookieSign));
    app.use(headersMiddleware());

    // Request handler (request logger) middleware
    // This middleware must be defined first
    app.use(requestHandlerMiddleware({ context }));

    // authentification middleware
    app.use(
      authentificatorMiddleware({
        context,
        authUrl: routes.auth,
        allowedUrl: [routes.playground],
      }),
    );

    // GraphiQL playground middleware
    if (usePlayground) {
      app.get(routes.playground, expressPlayground({ endpoint }));
    }

    // GraohQL Voyager middleware
    if (useVoyager) {
      const { accessToken } = configureTokens([''], context);
      logger.server.debug('New AccessToken was created special for GraphQL voyager', { accessToken });
      console.log('');
      console.log(
        `${chalk.yellow.bold('Note: ')}${chalk.yellow('An access token was created specifically for GraphQL voyager')}`,
      );
      console.log(
        `${chalk.yellow('This token was expire at')} ${chalk.yellowBright.bold(new Date(Date.now() + 1800 * 1000))}`,
      );
      console.log(chalk.yellow('After the token expires, you must restart the application'));
      app.use(
        routes.voyager,
        voyagerMiddleware({
          endpointUrl: endpoint,
          headersJS: JSON.stringify({
            Authorization: `Bearer ${accessToken.token}`,
          }),
        }),
      );
    }

    // only in dev mode you should have tokens with over then 8400 sec.
    if (process.env.NODE_ENV === 'development') {
      const { accessToken } = configureTokens([''], context);

      logger.server.debug('New AccessToken was created special for development', { accessToken });
      console.log('');
      console.log(chalk.yellow(`Your development Access token is: ${chalk.magenta(accessToken.token)}`));
    }

    // GraphQL server
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

    // Error handler middleware
    // This middleware most be defined first
    app.use(errorHandlerMiddleware({ context }));

    logger.server.debug('Application was created');

    return {
      app,
      context,
      schema,
      routes,
    };
  }
}

export default App;
export { App };

export interface IInitProps {
  port?: number;
  endpoint?: string;
  subscriptionsEndpoint?: string;
  timezone?: string;
  schemas: GraphQLSchema[];
  jwt: IJwtConfig;
  database: Omit<IDBConfig, 'logger' | 'localTimezone'>;
  logger: ILoggerCollection;
  routes?: {
    auth?: string;
    playground?: string;
    voyager?: string;
  };
  usePlayground?: boolean;
  useVoyager?: boolean;
  serverOptions: IServerOptions;
}

interface IServerOptions extends ServerOptions {
  key: ServerOptions['key'];
  cert: ServerOptions['cert'];
  cookieSign: string;
}

interface IInitDefaultProps extends IInitProps {
  port: number;
  endpoint: string;
  subscriptionsEndpoint: string;
  timezone: string;
  routes: {
    auth: string;
    playground: string;
    voyager: string;
    [key: string]: string;
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
  timezone: string;
}

export interface ISubServerConfig {
  schema: GraphQLSchema;
  server: Server;
}

export interface IBootstrapCallbackArgs {
  port: number;
  context: IContext;
  resolveUrl: {
    graphql: string;
    auth: string;
    playground?: string;
    voyager?: string;
  };
}
