/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import { createServer, Server, ServerOptions } from 'https';
import path from 'path';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request } from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import { applyMiddleware, IMiddlewareGenerator } from 'graphql-middleware';
import expressPlayground from 'graphql-playground-middleware-express';
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from 'graphql-scalars';
import { makeExecutableSchema, ITypedef, IResolvers } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import {
  IJwtConfig, TokenType, Authentificator, IAccessToken,
} from '../authentificator/authentificator';
import { authentificatorMiddleware } from '../authentificator/authentificatorMiddleware';
import { knexProvider, IDBConfig, KnexInstance } from '../databaseManager';
import {
  UnauthorizedError, customFormatErrorFn,
} from '../errorHandlers';
import { requestHandlerMiddleware, ILoggerCollection } from '../logger';
import {
  info, accounts, common, scalar,
} from '../schemas';
import {
  DEFAULT_SERVER_PORT,
  DEFAULT_GRAPHQL_ENDPOINT,
  DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_ROUTE_AUTH,
  DEFAULT_ROUTE_PLAYGROUND,
  DEFAULT_ROUTE_VOYAGER,
  MAXIMUM_REQUEST_BODY_SIZE,
} from '../utils';
import { configureTokens } from '../utils/configureTokens';
import { CronJobManager } from '../utils/cronJobManager';
import { loadGraphQLConfig } from '../utils/graphqlconfig';
import { headersMiddleware } from '../utils/headersMiddleware';

class App {
  public props: IInitDefaultProps;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: DEFAULT_SERVER_PORT,
      endpoint: DEFAULT_GRAPHQL_ENDPOINT,
      timezone: DEFAULT_SERVER_TIMEZONE,
      subscriptionEndpoint: DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
      usePlayground: process.env.NODE_ENV === 'development',
      useVoyager: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
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
    const {
      port, usePlayground, useVoyager, endpoint, routes, serverOptions, subscriptionEndpoint,
    } = this.props;

    const { app, schema, context } = this.createApp();
    const { logger } = context;
    const server = createServer(serverOptions, app);

    // Run HTTP server
    server.listen(port, () => {
      // set resolver URL's list
      const resolveUrl: IBootstrapCallbackArgs['resolveUrl'] = {
        graphql: `https://localhost:${port}${endpoint}`,
        auth: `https://localhost:${port}${routes.auth}`,
        subscriptions: `wss://localhost:${port}${subscriptionEndpoint}`,
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
      this.createSubscriptionServer({ schema, server, context });

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
    const { subscriptionEndpoint } = this.props;
    const { server, schema, context } = config;

    // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
    return new SubscriptionServer(
      {
        execute,
        schema,
        subscribe,
        onConnect: (connectionParams: any) => {
          const token = Authentificator.extractTokenFromSubscription(connectionParams);
          const payload = Authentificator.verifyToken(
            token,
            context.jwt.publicKey,
            context.jwt.blackList,
          );

          if (payload.type !== TokenType.access) {
            throw new UnauthorizedError('Is not an access token');
          }

          context.token = payload;
          return context;
        },
      },
      {
        server,
        path: subscriptionEndpoint,
      },
    );
  }

  public createApp() {
    const {
      typeDefs,
      resolvers,
      endpoint,
      timezone,
      port,
      jwt,
      permissions,
      middlewares,
      database,
      logger,
      routes,
      subscriptionEndpoint,
      usePlayground,
      playgroundConfig,
      useVoyager,
      serverOptions,
      debug,
    } = this.props as IInitDefaultProps;

    const { cookieSign } = serverOptions;

    logger.server.debug('Create application proc was started');

    // init main server handle
    const app = express();

    const schema = makeExecutableSchema({
      typeDefs: [

        // graphql-scalars
        ...scalarTypeDefs,

        // Common scalars
        scalar.typeDefs,

        // Common type definitions
        common.typeDefs,

        // user type definitions
        ...typeDefs || [],

        // developer schema defs
        info.typeDefs,

        // authentificator schema defs
        accounts.typeDefs,
      ],
      resolvers: [

        // graphql-scalars
        scalarResolvers,

        // Common scalars
        scalar.resolvers,

        // user resolvers
        ...resolvers || [],

        // developer info
        info.resolvers,

        // authentificator
        accounts.resolvers,
      ],
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
    });

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
      token: {
        type: TokenType.access,
        id: '',
        uuid: '',
        roles: [],
        exp: 0,
        iss: '',
      },
    };


    app.use(
      cors({
        credentials: true,
        origin: (origin, callback) => callback(null, true),
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
      app.get(routes.playground, expressPlayground({
        endpoint,
        subscriptionEndpoint,
        config: process.env.NODE_ENV === 'development' ? loadGraphQLConfig(path.resolve(__dirname, '../../.graphqlconfig')) : playgroundConfig,
      }));
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

    // GraphQL server
    app.use(
      endpoint,
      graphqlHTTP(
        async (req): Promise<OptionsData & { subscriptionEndpoint?: string }> => {
          const token = Authentificator.extractToken(TokenType.access, req as Request);
          const payload = Authentificator.verifyToken(
            token,
            context.jwt.publicKey,
            context.jwt.blackList,
          );

          if (payload.type !== TokenType.access) {
            throw new UnauthorizedError('Is not an access token');
          }

          context.token = payload;
          const graphQLMiddlewares = [
            // permissions
            ...permissions || [],
            accounts.permissions,

            // other middlewares
            ...middlewares || [],
          ];

          return {
            context,
            graphiql: false,
            schema: applyMiddleware(schema, ...graphQLMiddlewares),
            subscriptionEndpoint: `wss://localhost:${port}${subscriptionEndpoint}`,
            customFormatErrorFn: (error) => customFormatErrorFn({ error, context, debug }),
          };
        },
      ),
    );


    logger.server.debug('Application was created');

    CronJobManager.addJob('__clearExpiredTokens', {
      cronTime: '*/30 * * * * *',
      // cronTime: '* 0 5 * * *',
      onTick: async () => {
        const authentificator = new Authentificator({ context });
        await authentificator.clearExpiredTokens();
      },
      start: true,
    });

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
  subscriptionEndpoint?: string;
  timezone?: string;
  typeDefs?: ITypedef[];
  permissions?: IMiddlewareGenerator<any, IContext, any>[];
  middlewares?: IMiddlewareGenerator<any, IContext, any>[];
  resolvers?: Array<IResolvers<any, IContext>>;
  jwt: IJwtConfig;
  database: Omit<IDBConfig, 'logger' | 'localTimezone'>;
  logger: ILoggerCollection;
  routes?: {
    auth?: string;
    playground?: string;
    voyager?: string;
  };
  usePlayground?: boolean;
  playgroundConfig?: any;
  useVoyager?: boolean;
  serverOptions: IServerOptions;
  debug?: boolean;
}

interface IServerOptions extends ServerOptions {
  key: ServerOptions['key'];
  cert: ServerOptions['cert'];
  cookieSign: string;
}

interface IInitDefaultProps extends IInitProps {
  port: number;
  endpoint: string;
  subscriptionEndpoint: string;
  timezone: string;
  routes: {
    auth: string;
    playground: string;
    voyager: string;
    [key: string]: string;
  };
  usePlayground: boolean;
  useVoyager: boolean;
  debug: boolean;
}

export interface IContext {
  endpoint: string;
  jwt: IJwtConfig;
  knex: KnexInstance;
  logger: ILoggerCollection;
  emitter: EventEmitter;
  timezone: string;
  token: IAccessToken['payload'];
}

export interface ISubServerConfig {
  schema: GraphQLSchema;
  server: Server;
  context: IContext;
}

export interface IBootstrapCallbackArgs {
  port: number;
  context: IContext;
  resolveUrl: {
    graphql: string;
    auth: string;
    playground?: string;
    voyager?: string;
    subscriptions?: string;
  };
}
