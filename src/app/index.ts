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
import { infoSchema } from '~/schemas';

class App {
  public static buildRoutes(endpoint: string, routes: Partial<IInitProps['routes']>): Partial<IInitProps['routes']> {
    return {
      auth: `${endpoint}/auth`,
      playground: `${endpoint}/playground`,
      voyager: `${endpoint}/voyager`,
      ...routes,
    };
  }

  public static createApp(props: IInitProps) {
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
      playgroundInProduction,
      voyagerInProduction,
    } = props;

    const usePlayground = process.env.NODE_ENV === 'development' || !!playgroundInProduction;

    const useVoyager = process.env.NODE_ENV === 'development' || !!voyagerInProduction;

    // merge user schemas and legacy
    const schema = mergeSchemas({ schemas: [...schemas, infoSchema] });

    // generate routes
    const routesList = App.buildRoutes(endpoint, routes);

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

    // This middleware must be defined first
    app.use(requestHandlerMiddleware({ context }));
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    app.use(
      authentificatorMiddleware({
        context,
        authUrl: routesList.auth,
        allowedUrl: [routesList.playground],
      }),
    );

    if (usePlayground) {
      app.get(routesList.playground, expressPlayground({ endpoint }));
    }

    if (useVoyager) {
      app.use(routesList.voyager, voyagerMiddleware({ endpointUrl: endpoint }));
    }

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

    // return { app, context, schema, routes: routesList };
    return { ...props, app, context, schema, routes: routesList };
  }
}

export default App;
export { App };

export interface IInitProps {
  port?: number;
  endpoint: string;
  subscriptionsEndpoint: string;
  schemas: GraphQLSchema[];
  jwt: IJwtConfig;
  database: DBConfig;
  logger: ILoggerCollection;
  routes?: {
    auth?: string;
    playground?: string;
    voyager?: string;
  };
  playgroundInProduction?: boolean;
  voyagerInProduction?: boolean;
}

export interface IContext {
  endpoint: string;
  jwt: IJwtConfig;
  knex: KnexInstance;
  logger: ILoggerCollection;
  emitter: EventEmitter;
}
