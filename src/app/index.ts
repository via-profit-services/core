/* eslint-disable import/max-dependencies */
import type { InitDefaultProps, BootstrapCallbackArgs, SubServerConfig, Context, InitProps } from '@via-profit-services/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import { graphqlHTTP, OptionsData, RequestInfo } from 'express-graphql';
import session from 'express-session';
import fs from 'fs';
import { GraphQLSchema, execute, subscribe } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import http from 'http';
import https from 'https';
import Redis from 'ioredis';
import path from 'path';
import { performance } from 'perf_hooks';
import sessionStoreFactory from 'session-file-store';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { v4 as uuidv4 } from 'uuid';

import {
  DEFAULT_SERVER_PORT,
  DEFAULT_GRAPHQL_ENDPOINT,
  DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
  DEFAULT_INTROSPECTION_STATE,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_SESSION_SECRET,
  DEFAULT_SESSION_PATH,
  DEFAULT_SESSION_TTL,
  MAXIMUM_REQUEST_BODY_SIZE,
  DEFAULT_LOG_DIR,
} from '../constants';
import customFormatErrorFn from '../errorHandlers/customFormatErrorFn';
import errorMiddleware from '../errorHandlers/errorMiddleware';
import ServerError from '../errorHandlers/ServerError';
import configureLogger from '../logger/configure-logger';
import { DisableIntrospectionQueries } from '../utils/disableIntrospection';
import headersMiddleware from '../utils/headersMiddleware';


class Application {
  public props: InitDefaultProps;

  public constructor(props: InitProps) {
    // combine default props with passed props
    this.props = {
      port: DEFAULT_SERVER_PORT,
      endpoint: DEFAULT_GRAPHQL_ENDPOINT,
      timezone: DEFAULT_SERVER_TIMEZONE,
      subscriptionEndpoint: DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT,
      enableIntrospection: DEFAULT_INTROSPECTION_STATE,
      logDir: DEFAULT_LOG_DIR,
      debug: process.env.NODE_ENV === 'development',
      ...props,
    } as InitDefaultProps;

    // combine default session settings with passed
    this.props.sessions = this.props.sessions === false ? false : {
      path: DEFAULT_SESSION_PATH,
      ttl: DEFAULT_SESSION_TTL,
      secret: DEFAULT_SESSION_SECRET,
      ...this.props.sessions,
    };
  }

  public bootstrap(callback?: (args: BootstrapCallbackArgs) => void) {
    const {
      port,
      endpoint,
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
      const resolveUrl: BootstrapCallbackArgs['resolveUrl'] = {
        graphql: `${host}:${port}${endpoint}`,
        subscriptions: `ws${useSSL ? 's' : ''}://localhost:${port}${subscriptionEndpoint}`,
      };


      logger.server.debug(`App server started at «${resolveUrl.graphql}»`);


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

  public createSubscriptionServer(config: SubServerConfig) {
    const { subscriptionEndpoint, websocketOptions } = this.props;
    const { server, schema, context } = config;

    // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
    return new SubscriptionServer(
      {
        execute,
        schema,
        subscribe,
        onConnect: async () => context,
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

  public createApp(): { app: Express; context: Context; schema: GraphQLSchema;} {
    const {
      schema,
      endpoint,
      timezone,
      port,
      middlewares,
      redis,
      logDir,
      subscriptionEndpoint,
      enableIntrospection,
      serverOptions,
      debug,
      staticOptions,
      sessions,
    } = this.props as InitDefaultProps;

    const { cookieSign } = serverOptions || {};

    const logger = configureLogger({ logDir });
    const app = express();


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
    const preContext: Context = {
      endpoint,
      timezone,
      startTime: 0,
      logger,
      redis: redisHandle,
      pubsub: new RedisPubSub({
        publisher: redisPublisherHandle,
        subscriber: redisSubscriberHandle,
        connection: redis,
      }),
    };


    const contextMiddlewares = [...middlewares || []]
      .filter(({ context }) => context !== undefined)
      .map(({ context }) => context);

    // try to apply context middlewares
    const context: Context = [...contextMiddlewares || []]
      .reduce((prevContextState, middleware) => {

        try {
          return {
          ...prevContextState,
          ...middleware({
            config: this.props,
            context: prevContextState,
          }),
        }
        } catch (err) {

          throw new ServerError('Failed to load context middleware', { err });
        }
    }, preContext);


    // use sessions
    if (sessions !== false) {
      const SessionStore = sessionStoreFactory(session);
      sessions.logFn = (msg) => logger.server.info(msg);
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

    // apply Express middlewares
    [...middlewares || []]
      .filter(({ express }) => express !== undefined)
      .map(({ express }) => express)
      .forEach((middleware) => {
      try {
        app.use(middleware({
          context,
          config: this.props,
        }));
      } catch (err) {
        throw new ServerError('Failed to load Express middleware', { err });
      }
    });


    // This middleware must be defined last
    app.use(errorMiddleware({ context }));

    const extensions = (requestInfo: RequestInfo & { context: Context}) => ({
      queryTimeMs: performance.now() - requestInfo.context.startTime,
    });

    const graphqlMiddlewares = [...middlewares || []]
      .filter(({ graphql }) => graphql !== undefined)
      .map(({ graphql }) => graphql);

    // GraphQL server
    app.use(
      endpoint,
      graphqlHTTP(
        async (): Promise<OptionsData & { subscriptionEndpoint?: string }> => {

          const useSSL = serverOptions?.cert;
          context.startTime = performance.now();

          return {
            context,
            graphiql: false,
            schema: applyMiddleware<any, Context, any>(schema, ...graphqlMiddlewares),
            extensions: debug ? extensions : undefined,
            subscriptionEndpoint: `ws${useSSL ? 's' : ''}://localhost:${port}${subscriptionEndpoint}`,
            customFormatErrorFn: (error) => customFormatErrorFn({ error, context, debug }),
            validationRules: !enableIntrospection ? [DisableIntrospectionQueries] : [],
          };
        },
      ),
    );


    logger.server.debug('Application was created');

    return { app, context, schema };
  }
}

export default Application;
