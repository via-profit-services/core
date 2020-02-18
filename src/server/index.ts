/* eslint-disable import/max-dependencies */
import { EventEmitter } from 'events';
import cors from 'cors';
import express from 'express';
import graphqlHTTP, { OptionsData } from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import { mergeSchemas } from 'graphql-tools';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { authentificatorMiddleware, IJwtConfig } from '~/authentificator';
import { knexProvider, DBConfig, KnexInstance } from '~/databaseManager';
import { errorHandlerMiddleware, ILoggerCollection, requestHandlerMiddleware } from '~/logger';

export const getRoutes = (endpoint: string, routes: Partial<IInitProps['routes']>): Partial<IInitProps['routes']> => {
  return {
    auth: `${endpoint}/auth`,
    playground: `${endpoint}/playground`,
    voyager: `${endpoint}/voyager`,
    ...routes,
  };
};

const createServer = (props: IInitProps) => {
  const server = express();

  const { schemas, endpoint, port, jwt, database, logger, routes } = props;
  const subscriptionsEndpoint = '/subscriptions';
  const schema = mergeSchemas({ schemas });

  // generate routes
  const routesList = getRoutes(endpoint, routes);

  // define knex instance
  const knex = knexProvider({ logger, database });

  // define EventEmittre instance
  const emitter = new EventEmitter();

  const context: IContext = {
    endpoint,
    jwt,
    logger,
    knex,
    emitter,
  };

  // This middleware must be defined first
  server.use(requestHandlerMiddleware({ context }));
  server.use(cors());
  server.use(express.json({ limit: '50mb' }));
  server.use(express.urlencoded({ extended: true, limit: '50mb' }));

  server.use(
    authentificatorMiddleware({
      context,
      authUrl: routesList.auth,
      allowedUrl: [routesList.playground],
    }),
  );
  server.get(routesList.playground, expressPlayground({ endpoint }));
  server.use(routesList.voyager, voyagerMiddleware({ endpointUrl: endpoint }));
  server.use(
    endpoint,
    graphqlHTTP(
      async (): Promise<OptionsData & { subscriptionsEndpoint?: string }> => ({
        context,
        graphiql: false,
        schema,
        subscriptionsEndpoint: `ws://localhost:${port || 4000}${subscriptionsEndpoint}`,
      }),
    ),
  );

  // this middleware most be defined first
  server.use(errorHandlerMiddleware({ context }));

  // Create listener server by wrapping express app
  /* const webServer = createServer(app);

  webServer.listen(port, () => {
    logger.server.debug('Server was started', { port, endpoint, routesList });
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
  }); */

  return { server, context };
};

export interface IInitProps {
  port?: number;
  endpoint: string;
  schemas: GraphQLSchema[];
  jwt: IJwtConfig;
  database: DBConfig;
  logger: ILoggerCollection;
  routes?: {
    auth?: string;
    playground?: string;
    voyager?: string;
  };
}

export interface IContext {
  endpoint: string;
  jwt: IJwtConfig;
  knex: KnexInstance;
  logger: ILoggerCollection;
  emitter: EventEmitter;
}

export default createServer;
export { createServer };
// TODO Tests reuired
