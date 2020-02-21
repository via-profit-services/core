/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import { createServer } from 'http';
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
import { ServerError, errorHandlerMiddleware, requestHandlerMiddleware, ILoggerCollection } from '~/logger';
import { infoSchema } from '~/schemas';

class App {
  public props: IInitDefaultProps;

  public constructor(props: IInitProps) {
    // combine default props with passed props
    this.props = {
      port: 4000,
      endpoint: '/graphql',
      subscriptionsEndpoint: '/subscriptions',
      usePlayground: process.env.NODE_ENV === 'development',
      useVoyager: process.env.NODE_ENV === 'development',
      ...props,
    } as IInitDefaultProps;

    this.props.routes = {
      auth: '/auth',
      playground: '/playground',
      voyager: '/voyager',
      ...this.props.routes,
    } as IInitDefaultProps['routes'];
  }

  public bootstrap() {
    const { port, subscriptionsEndpoint, usePlayground, useVoyager, endpoint, routes } = this.props;
    const { app, schema } = this.createApp();
    const server = createServer(app);

    // Run HTTP server
    server.listen(port, () => {
      // connect websockrt subscriptions werver
      // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
      // eslint-disable-next-line no-new
      new SubscriptionServer(
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

      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);

      if (usePlayground) {
        console.log(
          `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
        );
      }
      console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
      if (useVoyager) {
        console.log(
          `${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`,
        );
      }
      console.log('');
    });
  }

  public createApp() {
    const app = express();

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
    } = this.props as IInitDefaultProps;

    // merge user schemas and legacy
    const schema = mergeSchemas({ schemas: [...schemas, infoSchema] });

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
      app.use(
        routes.voyager,
        voyagerMiddleware({
          endpointUrl: endpoint,
          headersJS: JSON.stringify({
            Authorization:
              'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYjIxMzlmNmYtNjAxOC00MTAyLWE1MzgtZDE3N2EzZjhkZGVmIiwicm9sZXMiOnt9LCJ0eXBlIjoiYWNjZXNzIiwiaWQiOiIyNDIzMWQ1Ni1mNzY2LTRhNTktOWJiYi1lM2JlYjY2NjYwMGIiLCJleHAiOjE1ODIwODc1NjExMzAsImlzcyI6InZpYXByb2ZpdC1zZXJ2aWNlcyIsImlhdCI6MTU4MjA4NTc2MX0.MBB4dc9vmeiosJbEGb7qogziiAMBK1EkO4IJvNBiP0Q5p1K-8pLbDPQi_2yfqOoLfSMzN5hbqDdwWv-hoELDYcTfnkml80apy45cTpeMZw2uBER3x2T98W49PT1jcjCzaY7iSJ-zTyxOfVcCdzrx0KYdT6NDFCkiDSjIJHTjKks_uEcXDrVBQvU9fmvrtQ7ggEXsGSYlXpsD6R0rytISB7N8gI6ip26xrPqTBe8Hf_noEKDuICif3gFRO4E1gOVMM_os1xT2M3WtgzQYvj6i2llFu0AQEV1qAK5mItcISj8BFBFgrsuHHykUaOAiQbiieszuUQx1If1DZljIM27sGFE0JdOf-HMxa24ZmaVftar4hkWmzAMoyxX0xtT3kZqZ5yKdl8f744qeZHB0p98IygIic0dr4gyzCbhYXgfF-aZs8Orut22CKwV0NneroX8sHsbSpyOOyi1hB1wmTN0CE8TDFXsb0huZSrmCSV07_NUCWa_9LfUHiZcoLlSj5TpjJXOcgxKOTyJqDS2zrQpo16kMFw1ILxhfExPje1euywsHQl3CDDKNifFTYUWq7LE5wPrjJIpuHR6UAYPcwmtR3HutPCkACb95f0hAQAWJ8no2_EFpCXYL_myYQYv3kqAhPilEE7OXON6FGC8yTu4Id31S36YIA7HXniuJgUeUeuQ',
          }),
        }),
      );
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
    readonly auth: string;
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
