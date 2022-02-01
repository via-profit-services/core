import http from 'node:http';
import type { GraphQLSchema } from 'graphql';

import { graphqlHTTPFactory } from '../index';

/**
 * Start the GraphQL server\
 * Call this promise before tests start\
 * ```ts
 * // Example of usage
 * beforeAll(async () => {
 *   await startServer();
 * });
 * ```
 */
type StartServer = () => Promise<void>;

/**
 * Syop the GraphQL server\
 * Call this promise after tests finished\
 * ```ts
 * // Example of usage
 * afterAll(async () => {
 *   await stopServer();
 * });
 * ```
 */
type StopServer = () => Promise<void>;

type ConfigTestOptions = {
  schema: GraphQLSchema;
  port: number;
  endpoint: string;
};

/**
 * Returns helpers for unit test of this GraphQL server
 */
type ConfigTest = (options: ConfigTestOptions) => {
  startServer: StartServer;
  stopServer: StopServer;
};

const configTest: ConfigTest = options => {
  const server = http.createServer();
  const { schema, port } = options;

  const startServer = async () =>
    new Promise<void>(resolve => {
      const graphqlHTTP = graphqlHTTPFactory({ schema });
      server.on('request', async (req, res) => {
        switch (true) {
          case req.url !== '':
            graphqlHTTP(req, res);
            break;

          default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end('Page not found');
            break;
        }
      });

      server.listen(port, 'localhost', () => {
        resolve();
      });
    });

  const stopServer = async () =>
    new Promise<void>(resolve => {
      server.close(err => {
        if (err) {
          console.error(err);
        }

        resolve();
      });
    });

  return { server, startServer, stopServer };
};

export default configTest;
