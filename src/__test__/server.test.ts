/**
 * SERVER / ADVANCED FUNCTIONAL SUITE
 * Covers:
 * 1. GET variables
 * 2. GET persisted queries
 * 3. POST invalid JSON
 * 4. POST empty body
 * 5. Wrong Content-Type
 * 6. Multipart missing map/operations
 * 7. Multipart multiple files
 * 8. Multipart binary files
 * 9. HEAD requests
 * 10. Unsupported HTTP methods
 * 11. GraphQL validation errors
 * 12. GraphQL resolver errors
 * 13. Large responses
 * 14. Wrong variables type
 */

import http from 'node:http';
import { URL } from 'node:url';

import configTest, { sendGraphQLRequest } from './config-test';
import schema from './schema';

const port = 8085;
const endpoint = '/graphql';

const { startServer, stopServer } = configTest({
  schema,
  port,
  endpoint,
  limits: {
    maxJSONBodySize: 2_000_000,
    maxGraphQLDepthLimit: 4,
  },
});

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

// Helper to build multipart bodies
function mp(boundary: string, parts: Array<{ headers: string[]; body: string | Buffer }>) {
  const out: string[] = [];
  for (const p of parts) {
    out.push(`--${boundary}`);
    out.push(...p.headers);
    out.push('');
    out.push(typeof p.body === 'string' ? p.body : p.body.toString());
  }
  out.push(`--${boundary}--`);
  out.push('');
  return out.join('\r\n');
}

describe('SERVER / ADVANCED SUITE', () => {
  //
  // 1. GET with variables
  //
  test('1.1 GET with variables', done => {
    const url = new URL(
      `http://localhost:${port}${endpoint}?query=query($x:Int!){echoInt(x:$x)}&variables=${encodeURIComponent(
        JSON.stringify({ x: 42 }),
      )}`,
    );

    http.get(url, res => {
      const buffers: Buffer[] = [];
      res.on('data', c => buffers.push(c));
      res.on('end', () => {
        const parsed = JSON.parse(Buffer.concat(buffers).toString());
        expect(parsed.data.echoInt).toBe(42);
        done();
      });
    });
  });

  //
  // 2. GET persisted query
  //
  test('2.1 GET persisted query', done => {
    const url = new URL(
      `http://localhost:${port}${endpoint}?persistedQuery=testQuery`,
    );

    http.get(url, res => {
      const buffers: Buffer[] = [];
      res.on('data', c => buffers.push(c));
      res.on('end', () => {
        const parsed = JSON.parse(Buffer.concat(buffers).toString());
        expect(parsed.data).toBeDefined();
        done();
      });
    });
  });

  //
  // 3. POST invalid JSON
  //
  test('3.1 POST invalid JSON', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: '{"query": "{ ping }", "variables": invalid}',
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/JSON/i);
  });

  //
  // 4. POST empty body
  //
  test('4.1 POST empty body', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: '',
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });

  //
  // 5. Wrong Content-Type
  //
  test('5.1 Wrong Content-Type', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: 'query { ping }',
      headers: { 'content-type': 'text/plain' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Content-Type/i);
  });

  //
  // 6. Multipart missing map
  //
  test('6.1 Multipart missing map', async () => {
    const boundary = '----adv';

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"mutation($f:Upload!){upload(file:$f)}","variables":{"f":null}}',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="a.txt"',
          'Content-Type: text/plain',
        ],
        body: 'hello',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/map/i);
  });

  //
  // 7. Multipart multiple files
  //
  test('7.1 Multipart multiple files', async () => {
    const boundary = '----multi';

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"mutation($f:[Upload!]!){uploadFiles(filesList:$f){mimeType}}","variables":{"f":[null,null]}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.f.0"],"1":["variables.f.1"]}',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="a.txt"',
          'Content-Type: text/plain',
        ],
        body: 'aaa',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="1"; filename="b.txt"',
          'Content-Type: text/plain',
        ],
        body: 'bbb',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatch(/mimeType/i);
  });

  //
  // 8. Multipart binary file
  //
  test('8.1 Multipart binary file', async () => {
    const boundary = '----binfile';
    const file = Buffer.from([0xde, 0xad, 0xbe, 0xef]);

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"mutation($f:Upload!){upload(file:$f)}","variables":{"f":null}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.f"]}',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="bin.dat"',
          'Content-Type: application/octet-stream',
        ],
        body: file,
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(200);
  });

  //
  // 9. HEAD request
  //
  test('9.1 HEAD request', done => {
    const req = http.request({
      method: 'HEAD',
      port,
      path: `${endpoint}?query={ping}`,
    });

    req.on('response', res => {
      expect(res.statusCode).toBe(200);
      done();
    });

    req.end();
  });

  //
  // 10. Unsupported HTTP method
  //
  test('10.1 PUT request', done => {
    const req = http.request({
      method: 'PUT',
      port,
      path: endpoint,
    });

    req.on('response', res => {
      expect(res.statusCode).toBe(200);
      done();
    });

    req.end();
  });

  //
  // 11. GraphQL validation error
  //
  test('11.1 Unknown field', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({ query: '{ unknownField }' }),
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Unknown/i);
  });

  //
  // 12. GraphQL resolver error
  //
  test('12.1 Resolver throws', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({ query: '{ throwError }' }),
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/error/i);
  });

  //
  // 13. Large response
  //
  test('13.1 Large response', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({ query: '{ bigList }' }),
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(1000);
  });

  //
  // 14. Wrong variables type
  //
  test('14.1 Variables is string', async () => {
    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: '{ ping }',
        variables: 'not-an-object',
      }),
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/variables/i);
  });
});
