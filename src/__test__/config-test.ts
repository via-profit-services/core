import http from 'node:http';
import type { GraphQLSchema } from 'graphql';

import { graphqlHTTPFactory } from '../index';
import { Limits } from '@via-profit-services/core';
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
  limits?: Limits;
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
  const { schema, port, limits } = options;

  const startServer = async () =>
    new Promise<void>(resolve => {
      const graphqlHTTP = graphqlHTTPFactory({ schema, limits });
      server.on('request', async (req, res) => {
        if (!['POST', 'GET'].includes(req.method)) {
          res.end();

          return;
        }

        const data = await graphqlHTTP(req, res);
        res.statusCode = data.errors ? 400 : 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(data));
        res.end();
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
          } catch (e) {
            parsed = {};
            // do nothing
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
