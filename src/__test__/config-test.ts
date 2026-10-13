import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { GraphQLSchema } from 'graphql';

import { graphqlHTTPFactory } from '../index';
import type { InitProps, Limits } from '@via-profit-services/core';
import { IncomingHttpHeaders } from 'http';

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
 * Stop the GraphQL server\
 * Call this promise after tests finished\
 * ```ts
 * // Example of usage
 * afterAll(async () => {
 *   await stopServer();
 * });
 * ```
 */
type StopServer = () => Promise<void>;

type ConfigTestOptions = Omit<InitProps, 'schema' | 'limits'> & {
  schema: GraphQLSchema;
  endpoint: string;
  limits?: Limits;
};

/**
 * Returns helpers for unit test of this GraphQL server.
 *
 * The server listens on a random free port (port 0), so test suites can run
 * in parallel and never collide with other processes on the machine.
 * Read the actual port from `port` after `startServer()` resolved.
 */
type ConfigTest = (options: ConfigTestOptions) => {
  server: http.Server;
  startServer: StartServer;
  stopServer: StopServer;
  readonly port: number;
};

const configTest: ConfigTest = options => {
  const server = http.createServer();
  const { endpoint: _endpoint, ...initProps } = options;

  const startServer = async () =>
    new Promise<void>(resolve => {
      const graphqlHTTP = graphqlHTTPFactory(initProps);
      server.on('request', async (req, res) => {
        if (!['POST', 'GET'].includes(req.method || '')) {
          res.end();

          return;
        }

        const data = await graphqlHTTP(req, res);
        res.statusCode = data.errors ? 400 : 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(data));
        res.end();
      });

      server.listen(0, 'localhost', () => resolve());
    });

  const stopServer = async () =>
    new Promise<void>(resolve => {
      server.closeAllConnections();
      server.close(err => {
        if (err) {
          console.error(err);
        }

        resolve();
      });
    });

  return {
    server,
    startServer,
    stopServer,
    get port() {
      return (server.address() as AddressInfo).port;
    },
  };
};

// Helper to send HTTP requests
type SendGraphQLRequestProps = {
  readonly port: number;
  readonly endpoint: string;
  readonly body: Buffer | string;
  readonly headers: Record<string, string>;
};

type SendGraphQLRequestPayload = {
  readonly status: number;
  readonly body: string;
  readonly headers?: IncomingHttpHeaders;
  readonly parsedBody: {
    readonly errors?: {
      readonly message: string;
    } | null;
    readonly data?: any;
  };
};
export const sendGraphQLRequest = (props: SendGraphQLRequestProps) => {
  const { body, headers, port, endpoint } = props;
  return new Promise<SendGraphQLRequestPayload>((resolve, reject) => {
    const req = http.request(
      {
        method: 'POST',
        host: 'localhost',
        port,
        path: endpoint,
        headers: {
          'content-length': Buffer.byteLength(body),
          ...headers,
        },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const stringifyBody = Buffer.concat(chunks).toString();
          let parsed;
          try {
            parsed = JSON.parse(stringifyBody);
          } catch {
            parsed = {};
          }

          resolve({
            headers: res.headers,
            status: res.statusCode || 0,
            body: stringifyBody,
            parsedBody: parsed,
          });
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

export default configTest;
