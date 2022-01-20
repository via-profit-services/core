import http from 'node:http';
import type { GraphQLSchema } from 'graphql';

import { graphqlHTTPFactory } from '../index';

const DEFAULT_TEST_PORT = 8080;
const DEFAULT_GRAPHQL_ENDPOINT = '/graphql';

/**
 * http.IncomingMessage with parsed GraphQL response
 */
interface IncomingMessage<T extends Record<string, any>> extends http.IncomingMessage {
  data: T;
  errors: Array<Record<string, any>>;
}

/**
 * HTTP options\
 * Your options will be assigned with defaults options\
 * Default options via `method`, `path`, `port` and `headers` already passed
 */
interface RequestOptions extends http.RequestOptions {
  body: string | Buffer;
  headers?: http.OutgoingHttpHeaders;
}

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

/**
 * Prepare and send request to GraphQl server.\
 */
type GraphQLRequest = <T = Record<string, any>>(
  options: RequestOptions,
) => Promise<IncomingMessage<T>>;

type ConfigTestOptions = {
  schema: GraphQLSchema;
  port?: number;
  endpoint?: string;
};

/**
 * Returns helpers for unit test of this GraphQL server
 */
type ConfigTest = (options: ConfigTestOptions) => {
  startServer: StartServer;
  stopServer: StopServer;
  request: GraphQLRequest;
};

const configTest: ConfigTest = options => {
  const server = http.createServer();
  const config: Required<ConfigTestOptions> = {
    port: DEFAULT_TEST_PORT,
    endpoint: DEFAULT_GRAPHQL_ENDPOINT,
    ...options,
  };

  const { schema, port, endpoint } = config;

  const startServer = async () =>
    new Promise<void>(resolve => {
      graphqlHTTPFactory({ schema }).then(graphqlHTTP => {
        server.on('request', async (req, res) => {
          switch (req.url) {
            case endpoint:
              graphqlHTTP(req, res);
              break;

            default:
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html');
              res.end('Page not found');
              break;
          }
        });

        server.listen(port, () => {
          resolve();
        });
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

  const request: GraphQLRequest = async params =>
    new Promise(resolve => {
      const { body, headers } = params;
      const options: http.RequestOptions = {
        method: 'POST',
        path: endpoint,
        port,
        headers,
      };

      const request = http.request(options, socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { data, errors } = JSON.parse(response);

          (socket as any).data = data;
          (socket as any).errors = errors;
          resolve(socket as any);
        });
      });

      request.write(body);
      request.end();
    });

  return { server, startServer, stopServer, request };
};

export default configTest;
