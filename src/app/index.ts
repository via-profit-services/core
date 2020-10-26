/* eslint-disable import/max-dependencies */
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { performance } from 'perf_hooks';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import DeviceDetector from 'device-detector-js';
import express, { Express, Request } from 'express';
import { graphqlHTTP, OptionsData, RequestInfo } from 'express-graphql';
import session from 'express-session';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import Redis from 'ioredis';
import sessionStoreFactory from 'session-file-store';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { v4 as uuidv4 } from 'uuid';

import { authMiddleware } from '../auth';
import { knexProvider } from '../databaseManager';
import {
  UnauthorizedError,
  customFormatErrorFn,
  ServerError,
} from '../errorHandlers';
import errorMiddleware from '../errorHandlers/errorMiddleware';
import { requestHandlerMiddleware } from '../logger';
import {
  info,
  // accounts,
  auth,
  common,
  scalar,
} from '../schemas';
import AuthService from '../schemas/auth/service';
import { TokenType } from '../schemas/auth/types';
import {
  IInitDefaultProps,
  IInitProps,
  IBootstrapCallbackArgs,
  ISubServerConfig,
  IContext,
  makeExecutableSchema,
} from '../types';
import {
  DEFAULT_SERVER_PORT,
  DEFAULT_AUTH_ENDPOINT,
  DEFAULT_GRAPHQL_ENDPOINT,
  DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_ROUTE_VOYAGER,
  DEFAULT_ROUTE_GRAPHIQL,
  DEFAULT_SESSION_SECRET,
  DEFAULT_SESSION_PATH,
  DEFAULT_SESSION_TTL,
  MAXIMUM_REQUEST_BODY_SIZE,
} from '../utils';
import { configureTokens } from '../utils/configureTokens';
import { CronJobManager } from '../utils/cronJobManager';
import { DisableIntrospectionQueries } from '../utils/disableIntrospection';
import { headersMiddleware } from '../utils/headersMiddleware';


class App {
  public props: IInitDefaultProps;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: DEFAULT_SERVER_PORT,
      endpoint: DEFAULT_GRAPHQL_ENDPOINT,
      authEndpoint: DEFAULT_AUTH_ENDPOINT,
      timezone: DEFAULT_SERVER_TIMEZONE,
      subscriptionEndpoint: DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
      usePlayground: process.env.NODE_ENV === 'development',
      enableIntrospection: process.env.NODE_ENV === 'development',
      useVoyager: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
      ...props,
    } as IInitDefaultProps;

    // combine default session settings with passed
    this.props.sessions = this.props.sessions === false ? false : {
      path: DEFAULT_SESSION_PATH,
      ttl: DEFAULT_SESSION_TTL,
      secret: DEFAULT_SESSION_SECRET,
      ...this.props.sessions,
    };

    // combine default routes with passed
    this.props.routes = {
      voyager: DEFAULT_ROUTE_VOYAGER,
      ...this.props.routes,
    } as IInitDefaultProps['routes'];
  }

  public bootstrap(callback?: (args: IBootstrapCallbackArgs) => void) {
    const {
      port,
      usePlayground,
      useVoyager,
      endpoint,
      authEndpoint,
      routes,
      serverOptions,
      subscriptionEndpoint,
    } = this.props;

    const { app, schema, context } = this.createApp();
    const { logger } = context;
    const useSSL = serverOptions?.cert;

    process.on('warning', (e) => logger.server.warn(e.name, e));

    let server: http.Server | https.Server;
    try {
      server = useSSL
        ? https.createServer(serverOptions || {}, app)
        : http.createServer(serverOptions || {}, app);
    } catch (err) {
      logger.server.error('Failed to start server', { err });
      throw new ServerError('Failed to start server', err);
    }


    const host = `http${useSSL ? 's' : ''}://localhost`;

    // Run HTTP server
    server.listen(port, () => {
      // set resolver URL's list
      const resolveUrl: IBootstrapCallbackArgs['resolveUrl'] = {
        graphql: `${host}:${port}${endpoint}`,
        auth: `${host}:${port}${authEndpoint}`,
        subscriptions: `ws${useSSL ? 's' : ''}://localhost:${port}${subscriptionEndpoint}`,
      };


      logger.server.debug(`App server started at «${resolveUrl.graphql}»`);
      logger.server.debug(`Authentification server started at «${resolveUrl.auth}»`);

      if (usePlayground) {
        resolveUrl.graphiql = `${host}:${port}${endpoint}${DEFAULT_ROUTE_GRAPHIQL}`;
        logger.server.debug(`Graphiql resolved at «${resolveUrl.graphiql}»`);
      }

      if (useVoyager) {
        resolveUrl.voyager = `${host}:${port}${routes.voyager}`;
        logger.server.debug(`Voyager resolved at «${resolveUrl.voyager}»`);
      }


      // connect websocket subscriptions werver
      this.createSubscriptionServer({ schema, server, context });

      logger.server.debug(`Suscription server started at ${resolveUrl.subscriptions}`);

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
    const { subscriptionEndpoint, websocketOptions } = this.props;
    const { server, schema, context } = config;

    const authService = new AuthService({ context });

    // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
    return new SubscriptionServer(
      {
        execute,
        schema,
        subscribe,
        onConnect: async (connectionParams: any) => {
          const token = AuthService.extractTokenFromSubscription(connectionParams);

          const payload = await authService.verifyToken(token);

          if (!payload) {
            throw new UnauthorizedError('Invalid token');
          }

          if (payload.type !== TokenType.access) {
            throw new UnauthorizedError('Is not an access token');
          }

          context.token = payload;
          return context;
        },
        onDisconnect: (webSocket: any) => {
          webSocket.close();
          webSocket.terminate();
        },
      },
      {
        server,
        path: subscriptionEndpoint,
        ...websocketOptions,
      },
    );
  }

  public createApp(): {
    app: Express;
      context: IContext;
      schema: GraphQLSchema;
      routes: IInitProps['routes'];
      } {
    const {
      typeDefs,
      resolvers,
      endpoint,
      authEndpoint,
      timezone,
      port,
      jwt,
      middlewares,
      database,
      expressMiddlewares,
      redis,
      logger,
      routes,
      subscriptionEndpoint,
      usePlayground,
      enableIntrospection,
      useVoyager,
      serverOptions,
      debug,
      staticOptions,
      sessions,
    } = this.props as IInitDefaultProps;

    const { cookieSign } = serverOptions || {};

    logger.server.debug('Create application proc was started');

    // init main server handle
    const app = express();

    const schema = makeExecutableSchema({
      typeDefs: [
        scalar.typeDefs,
        common.typeDefs,
        info.typeDefs,
        // accounts.typeDefs,
        auth.typeDefs,
        ...typeDefs || [],
      ],
      resolvers: [
        scalar.resolvers,
        info.resolvers,
        // accounts.resolvers,
        auth.resolvers,
        ...resolvers || [],
      ],
      // resolverValidationOptions: {
      // requireResolversForResolveType: false,
      // },
    });

    // define knex instance
    const knex = knexProvider({
      localTimezone: timezone,
      logger,
      ...database,
    });

    // configure cron job manager
    CronJobManager.configure({ logger });

    let redisHandle: Redis.Redis;
    let redisPublisherHandle: Redis.Redis;
    let redisSubscriberHandle: Redis.Redis;

    const redisConfig = {
      retryStrategy: (times: number) => Math.min(times * 50, 20000),
      ...redis,
    };

    try {
      redisHandle = new Redis(redisConfig);
      redisPublisherHandle = new Redis(redisConfig);
      redisSubscriberHandle = new Redis(redisConfig);
    } catch (err) {
      throw new ServerError('Failed to init Redis handle', { err });
    }

    redisHandle.on('error', (err) => {
      logger.server.error(`Redis Common error ${err.errno}`, { err });
    });

    redisPublisherHandle.on('error', (err) => {
      logger.server.error(`Redis Publisher error ${err.errno}`, { err });
    });

    redisSubscriberHandle.on('error', (err) => {
      logger.server.error(`Redis Subscriber error ${err.errno}`, { err });
    });

    redisHandle.on('connect', () => {
      logger.server.debug('Redis common connection is Done');
    });

    redisPublisherHandle.on('connect', () => {
      logger.server.debug('Redis Publisher connection is Done');
    });

    redisSubscriberHandle.on('connect', () => {
      logger.server.debug('Redis Subscriber connection is Done');
    });

    redisHandle.on('reconnecting', () => {
      logger.server.debug('Redis common reconnecting');
    });

    redisPublisherHandle.on('reconnecting', () => {
      logger.server.debug('Redis Publisher reconnecting');
    });

    redisSubscriberHandle.on('reconnecting', () => {
      logger.server.debug('Redis Subscriber reconnecting');
    });

    redisHandle.on('close', () => {
      logger.server.debug('Redis common close');
    });

    redisPublisherHandle.on('close', () => {
      logger.server.debug('Redis Publisher close');
    });

    redisSubscriberHandle.on('close', () => {
      logger.server.debug('Redis Subscriber close');
    });


    // combine finally context object
    const context: IContext = {
      endpoint,
      timezone,
      jwt,
      logger,
      redis: redisHandle,
      pubsub: new RedisPubSub({
        publisher: redisPublisherHandle,
        subscriber: redisSubscriberHandle,
        connection: redis,
      }),
      knex,
      deviceInfo: {
        client: {
          type: '',
          name: '',
          version: '',
          engine: '',
          engineVersion: '',
        },
        os: {
          name: '',
          version: '',
          platform: '',
        },
        device: {
          type: '',
          brand: '',
          model: '',
        },
        bot: null,
      },
      startTime: 0,
      token: {
        type: TokenType.access,
        id: '',
        uuid: '',
        roles: [],
        exp: 0,
        iss: '',
      },
    };

    // use sessions
    if (sessions !== false) {
      const SessionStore = sessionStoreFactory(session);
      sessions.logFn = (msg) => logger.session.info(msg);
      app.use(session({
        store: new SessionStore(sessions),
        secret: sessions.secret,
        genid: () => uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: process.env.NODE_ENV !== 'development',
        },
      }));

      if (process.env.NODE_ENV !== 'development') {
        app.set('trust proxy', 1);
      }
    }

    app.use(cors({
      credentials: true,
      origin: (origin, callback) => callback(null, true),
    }));
    app.use(express.json({ limit: MAXIMUM_REQUEST_BODY_SIZE }));
    app.use(express.urlencoded({ extended: true, limit: MAXIMUM_REQUEST_BODY_SIZE }));
    app.use(cookieParser(cookieSign));
    app.use(headersMiddleware());

    // define express static
    if (staticOptions) {
      const staticPath = path.resolve(staticOptions.staticDir);
      if (!fs.existsSync(staticPath)) {
        fs.mkdirSync(staticPath, { recursive: true });
      }
      app.use(staticOptions.prefix, express.static(staticPath));
    }

    app.use(authMiddleware({ context, endpoint: authEndpoint }));

    // Request handler (request logger) middleware
    app.use(requestHandlerMiddleware({ context }));

    if (expressMiddlewares && expressMiddlewares.length) {
      expressMiddlewares.forEach((middleware) => {
        app.use(middleware({ context }));
      });
    }

    // This middleware must be defined last
    app.use(errorMiddleware({ context }));


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


    const extensions = (requestInfo: RequestInfo & { context: IContext}) => {
      return {
        queryTimeMs: performance.now() - requestInfo.context.startTime,
      };
    };

    const authService = new AuthService({ context });

    // GraphQL server
    app.use(
      endpoint,
      graphqlHTTP(
        async (req): Promise<OptionsData & { subscriptionEndpoint?: string }> => {
          const token = AuthService.extractToken(TokenType.access, req as Request);
          const payload = await authService.verifyToken(token);

          if (!payload) {
            throw new UnauthorizedError('Invalid token');
          }

          if (payload.type !== TokenType.access) {
            throw new UnauthorizedError('Is not an access token');
          }

          context.token = payload;

          const useSSL = serverOptions?.cert;
          const deviceDetector = new DeviceDetector();
          context.deviceInfo = deviceDetector.parse(req.headers['user-agent']);

          context.startTime = performance.now();
          const graphQLMiddlewares = [

            // other middlewares
            ...middlewares || [],
          ];

          return {
            context,
            graphiql: usePlayground,
            extensions: debug ? extensions : undefined,
            schema: applyMiddleware<any, IContext, any>(schema, ...graphQLMiddlewares),
            subscriptionEndpoint: `ws${useSSL ? 's' : ''}://localhost:${port}${subscriptionEndpoint}`,
            customFormatErrorFn: (error) => customFormatErrorFn({ error, context, debug }),
            validationRules: !enableIntrospection ? [DisableIntrospectionQueries] : [],
          };
        },
      ),
    );


    logger.server.debug('Application was created');

    CronJobManager.addJob('__clearExpiredTokens', {
      cronTime: process.env.NODE_ENV === 'development'
        ? '* 5 * * * *'
        : '* 0 5 * * *',
      onTick: async () => {
        await authService.clearExpiredTokens();
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
export { App, withFilter };
