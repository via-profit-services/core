/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import { createServer, Server, ServerOptions } from 'https';
import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import { mergeSchemas } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { IJwtConfig } from '~/authentificator/authentificator';
import { authentificatorMiddleware } from '~/authentificator/authentificatorMiddleware';
import { knexProvider, DBConfig, KnexInstance } from '~/databaseManager';
import { errorHandlerMiddleware, requestHandlerMiddleware, ILoggerCollection } from '~/logger';
import { accountsSchema } from '~/schemas';
import { configureTokens } from '~/utils/configureTokens';

class App {
  public props: IInitDefaultProps;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: 4000,
      endpoint: '/graphql',
      timezone: 'UTC',
      subscriptionsEndpoint: '/subscriptions',
      usePlayground: process.env.NODE_ENV === 'development',
      useVoyager: process.env.NODE_ENV === 'development',
      ...props,
    } as IInitDefaultProps;

    // combine default routes with passed
    this.props.routes = {
      auth: '/auth',
      playground: '/playground',
      voyager: '/voyager',
      ...this.props.routes,
    } as IInitDefaultProps['routes'];
  }

  public bootstrap(callback?: (args: IBootstrapCallbackArgs) => void) {
    const { port, usePlayground, useVoyager, endpoint, routes, serverOptions } = this.props;
    const { app, schema, context } = this.createApp();
    const server = createServer(serverOptions, app);

    // Run HTTP server
    server.listen(port, () => {
      // connect websockrt subscriptions werver
      this.createSubscriptionServer({ schema, server });

      const resolveUrl: IBootstrapCallbackArgs['resolveUrl'] = {
        graphql: `http://localhost:${port}${endpoint}`,
        auth: `http://localhost:${port}${routes.auth}`,
      };

      if (usePlayground) {
        resolveUrl.playground = `http://localhost:${port}${routes.playground}`;
      }

      if (useVoyager) {
        resolveUrl.voyager = `http://localhost:${port}${routes.voyager}`;
      }

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
    const app = express();

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
    } = this.props as IInitDefaultProps;

    // merge user schemas and legacy
    const schema = mergeSchemas({ schemas: [...schemas, accountsSchema] });

    // define knex instance
    const knex = knexProvider({ logger, database });

    // define EventEmittre instance
    const emitter = new EventEmitter();

    // combine finally context object
    const context: IContext = {
      endpoint,
      timezone,
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
  database: DBConfig;
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
