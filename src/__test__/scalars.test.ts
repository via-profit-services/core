import http from 'node:http';
import { URL } from 'node:url';
import configTest, { sendGraphQLRequest } from './config-test';
import schema from './schema';

const port = 8082;
const endpoint = '/graphql';
const { startServer, stopServer } = configTest({ schema, port, endpoint });

describe('DateTime scalar', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  test('serialize: Date → ISO-UTC string', async () => {
    const date = new Date(Date.UTC(2026, 2, 5, 12, 30, 0)); // 2026-03-05T12:30:00Z

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: date.toISOString() },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeUndefined();
    expect(parsedBody.data.echoDateTime).toBe('2026-03-05T12:30:00.000Z');
  });

  test('parseValue: valid ISO-UTC string', async () => {
    const iso = '2026-03-05T10:15:20.000Z';

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: iso },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeUndefined();
    expect(parsedBody.data.echoDateTime).toBe(iso);
  });

  test('parseValue: reject string without Z', async () => {
    const bad = '2026-03-05T10:15:20';

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: bad },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeDefined();
    expect((parsedBody.errors as any)[0].message).toMatch(/ISO-UTC/);
  });

  test('parseValue: reject invalid date', async () => {
    const bad = '2026-13-99T99:99:99.999Z';

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: bad },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeDefined();
    expect((parsedBody.errors as any)[0].message).toMatch(/invalid/);
  });

  test('parseValue: reject timestamp in seconds', async () => {
    const seconds = Math.floor(Date.now() / 1000); // invalid

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: seconds },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeDefined();
    expect((parsedBody.errors as any)[0].message).toMatch(/Invalid timestamp/);
  });

  test('parseValue: accept timestamp in milliseconds', async () => {
    const ms = Date.UTC(2026, 2, 5, 12, 0, 0); // valid

    const { parsedBody } = await sendGraphQLRequest({
      port,
      endpoint,
      body: JSON.stringify({
        query: 'query($d: DateTime!) { echoDateTime(dt: $d) }',
        variables: { d: ms },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(parsedBody.errors).toBeUndefined();
    expect(parsedBody.data.echoDateTime).toBe('2026-03-05T12:00:00.000Z');
  });

  test('parseLiteral: valid literal string', done => {
    const url = new URL(
      `http://localhost:${port}${endpoint}?query=query{echoDateTime(dt:"2026-03-05T12:00:00.000Z")}`,
    );

    http.get(url, res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));
      res.on('end', () => {
        const { data, errors } = JSON.parse(Buffer.concat(buffers).toString());

        try {
          expect(errors).toBeUndefined();
          expect(data.echoDateTime).toBe('2026-03-05T12:00:00.000Z');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  test('parseLiteral: reject literal without Z', done => {
    const url = new URL(
      `http://localhost:${port}${endpoint}?query=query{echoDateTime(dt:"2026-03-05T12:00:00")}`,
    );

    http.get(url, res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));
      res.on('end', () => {
        const { errors } = JSON.parse(Buffer.concat(buffers).toString());

        try {
          expect(errors).toBeDefined();
          expect(errors[0].message).toMatch(/ISO-UTC/);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
