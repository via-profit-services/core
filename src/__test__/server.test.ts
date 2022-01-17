import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import http from 'node:http';

import { graphqlHTTPFactory } from '../index';

const server = http.createServer();
const schema = new GraphQLSchema({
  description: 'Testing only',
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      getFourAsString: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'four',
      },
      getFourAsNumber: {
        type: new GraphQLNonNull(GraphQLInt),
        resolve: () => 4,
      },
    },
  }),
});

beforeAll(
  async () =>
    new Promise<void>(resolve => {
      graphqlHTTPFactory({
        schema,
      }).then(graphqlHTTP => {
        server.on('request', async (req, res) => {
          switch (req.url) {
            case '/graphql':
              graphqlHTTP(req, res);
              break;

            default:
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html');
              res.end('Page not found');
              break;
          }
        });

        server.listen(8080, () => {
          resolve();
        });
      });
    }),
);

afterAll(
  async () =>
    new Promise<void>(resolve => {
      server.close(err => {
        if (err) {
          console.error(err);
        }
        resolve();
      });
    }),
);

describe('Graphql server', () => {
  test('test', done => {
    const request = http.request(
      {
        method: 'POST',
        path: '/graphql',
        port: 8080,
        headers: {
          'Content-Type': 'application/json',
        },
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { data } = JSON.parse(response);

          expect(socket.statusCode).toBe(200);
          expect(socket.headers).toEqual(
            expect.objectContaining({
              'content-type': 'application/json',
            }),
          );
          expect(data).toBeInstanceOf(Object);
          expect(data).toEqual(
            expect.objectContaining({
              getFourAsString: 'four',
              getFourAsNumber: 4,
            }),
          );
          done();
        });
      },
    );
    request.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
      }),
    );
    request.end();
  });
});
