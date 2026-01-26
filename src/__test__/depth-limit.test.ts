import http from 'node:http';

import configTest from './config-test';
import schema from './schema';

const port = 8082;
const endpoint = '/graphql';
const { startServer, stopServer } = configTest({
  schema,
  port,
  endpoint,
  limits: {
    maxGraphQLDepthLimit: 3,
  },
});

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

describe('Graphql depth limit tests', () => {
  test('Depth-limit: query deeper than allowed should be rejected', done => {
    const query = `
      query DepthLimitReject {
        users {
          id
          account {
            user {
              name
              account {
               id
              }
            }
          }
        }
      }
    `;

    const body = JSON.stringify({ query, variables: {} });
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    });
    req.on('response', res => {
      const buffers: Buffer[] = [];
      res.on('data', chunk => buffers.push(chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(Buffer.concat(buffers).toString());
        } catch (err) {
          return done(err);
        }
        const { data, errors } = parsed;
        try {
          expect(res.statusCode).toBe(400);
          expect(data).toBeUndefined();
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: expect.stringContaining('depth'),
                extensions: expect.objectContaining({
                  errorType: 'graphql-error-validate-field',
                }),
              }),
            ]),
          );
          done();
        } catch (err) {
          done(err);
        }
      });
      res.on('error', err => done(err));
    });
    req.on('error', err => done(err));
    req.write(body);
    req.end();
  });


  test('Depth-limit: query is fine than request should be accepted', done => {
    const query = `
      query DepthLimitFine {
        users {
          id
          account {
            user {
              name
            }
          }
        }
      }
    `;

    const body = JSON.stringify({ query, variables: {} });
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    });
    req.on('response', res => {
      const buffers: Buffer[] = [];
      res.on('data', chunk => buffers.push(chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(Buffer.concat(buffers).toString());
        } catch (err) {
          return done(err);
        }
        const { errors } = parsed;
        try {
          expect(res.statusCode).toBe(200);
          expect(errors).toBeUndefined();

          done();
        } catch (err) {
          done(err);
        }
      });
      res.on('error', err => done(err));
    });
    req.on('error', err => done(err));
    req.write(body);
    req.end();
  });
});
