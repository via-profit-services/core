/**
 * SECURITY / PENTEST SUITE
 * Covers:
 * 1. Body overflow
 * 2. GZIP attacks
 * 3. Multipart attacks
 * 4. Multipart limits
 * 5. Header attacks
 * 6. Race conditions
 * 7. GraphQL depth/complexity attacks
 * 8. TempFile safety
 * 9. Map-path attacks
 * 10. Multipart ordering attacks
 */

import http from 'node:http';
import { TempFile } from '../utils/TempFile'; // путь подправь под свой проект

import configTest, { sendGraphQLRequest } from './config-test';
import schema from './schema';

const port = 8083;
const endpoint = '/graphql';
const { startServer, stopServer } = configTest({
  schema,
  port,
  endpoint,
  limits: {
    maxJSONBodySize: 2_000_000,
    maxFileSize: 1_000_000,
    maxGraphQLDepthLimit: 4,
  },
});

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

//
// // Helper to send HTTP requests
// function send(body: Buffer | string, headers: Record<string, string>) {
//   return new Promise<{ status: number; body: string }>((resolve, reject) => {
//     const req = http.request(
//       {
//         method: 'POST',
//         port,
//         path: endpoint,
//         headers: {
//           'content-length': Buffer.byteLength(body),
//           ...headers,
//         },
//       },
//       res => {
//         const chunks: Buffer[] = [];
//         res.on('data', c => chunks.push(c));
//         res.on('end', () =>
//           resolve({
//             status: res.statusCode || 0,
//             body: Buffer.concat(chunks).toString(),
//           }),
//         );
//       },
//     );
//     req.on('error', reject);
//     req.write(body);
//     req.end();
//   });
// }

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

describe('SECURITY SUITE', () => {
  //
  // 1. BODY OVERFLOW
  //
  test('1.1 JSON body overflow', async () => {
    const big = 'x'.repeat(2_000_001);
    const body = JSON.stringify({ query: '{ ping }', variables: { big } });

    const res = await sendGraphQLRequest({
      body,
      endpoint,
      port,
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/exceeds/i);
  });

  //
  // 2. GZIP ATTACKS
  //
  test('2.1 Invalid gzip body', async () => {
    const bad = Buffer.from('not-a-gzip');

    const res = await sendGraphQLRequest({
      endpoint,
      port,
      body: bad,
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'gzip',
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Failed to read body/i);
  });

  //
  // 3. MULTIPART ATTACKS
  //
  test('3.1 Multiple operations fields', async () => {
    const boundary = '----pentest';
    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({ query: '{ ping }', variables: {} }),
      },
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({ query: '{ pong }', variables: {} }),
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/operations/i);
  });

  test('3.2 Invalid JSON in map', async () => {
    const boundary = '----pentest';
    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({
          query: 'mutation ($file: Upload!) { upload(file: $file) }',
          variables: { file: null },
        }),
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{ invalid-json',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Invalid JSON in the «map»/i);
  });

  //
  // 4. MULTIPART LIMITS
  //
  test('4.1 File exceeds maxFileSize', async () => {
    const boundary = '----pentest';
    const file = 'x'.repeat(1_000_001);

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({
          query: 'mutation ($file: Upload!) { upload(file: $file) }',
          variables: { file: null },
        }),
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: JSON.stringify({ 0: ['variables.file'] }),
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="big.txt"',
          'Content-Type: text/plain',
        ],
        body: file,
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/exceeds the .* byte size limit/i);
  });

  //
  // 5. HEADER ATTACKS
  //
  test('5.1 Missing Content-Type', async () => {
    const body = JSON.stringify({ query: '{ ping }' });

    const res = await sendGraphQLRequest({ port, endpoint, body, headers: {} });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Missing Content-Type/i);
  });

  //
  // 6. RACE CONDITIONS
  //
  test('6.1 Client aborts upload', done => {
    const boundary = '----pentest';
    const head = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="operations"',
      '',
      JSON.stringify({
        query: 'mutation ($file: Upload!) { upload(file: $file) }',
        variables: { file: null },
      }),
      `--${boundary}`,
      'Content-Disposition: form-data; name="map"',
      '',
      JSON.stringify({ 0: ['variables.file'] }),
      `--${boundary}`,
      'Content-Disposition: form-data; name="0"; filename="file.txt"',
      'Content-Type: text/plain',
      '',
    ].join('\r\n');

    const req = http.request({
      method: 'POST',
      port,
      path: endpoint,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    // Если сервер упадёт — тест упадёт
    req.on('error', () => {
      // Это нормальное поведение при destroy()
      done();
    });

    // Если сервер НЕ упал — тест тоже должен завершиться
    setTimeout(() => {
      done();
    }, 50);

    req.write(head);
    req.destroy(); // simulate abort
  });

  //
  // 7. GRAPHQL DEPTH ATTACKS
  //
  test('7.1 Too deep query', async () => {
    const query = `
      query {
        a { a { a { a { a { a { a { a { a { a } } } } } } } } }
      }
    `;
    const body = JSON.stringify({ query });

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/depth/i);
  });

  //
  // 8. TEMPFILE SAFETY
  //
  test('8.1 TempFile: createReadStream before end', async () => {
    const tmp = new TempFile();
    tmp.write(Buffer.from('test'));

    expect(() => tmp.createReadStream()).toThrow(/before file is closed/i);

    await tmp.end();
    const stream = tmp.createReadStream();
    stream.destroy();
    tmp.cleanup();
  });

  test('8.2 TempFile: cleanup twice', async () => {
    const tmp = new TempFile();
    tmp.write(Buffer.from('test'));
    await tmp.end();

    tmp.cleanup();
    expect(() => tmp.cleanup()).not.toThrow();
  });

  //
  // 9. MAP-PATH ATTACKS
  //
  test('9.1 Map points to non-existing path', async () => {
    const boundary = '----pentest';

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({
          query: 'mutation ($file: Upload!) { upload(file: $file) }',
          variables: {},
        }),
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: JSON.stringify({ 0: ['variables.file.not.exists'] }),
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="file.txt"',
          'Content-Type: text/plain',
        ],
        body: 'content',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Invalid|path/i);
  });

  //
  // 10. MULTIPART ORDERING ATTACKS
  //
  test('10.1 Files before operations', async () => {
    const boundary = '----pentest';

    const body = mp(boundary, [
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="file.txt"',
          'Content-Type: text/plain',
        ],
        body: 'content',
      },
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: JSON.stringify({
          query: 'mutation ($file: Upload!) { upload(file: $file) }',
          variables: { file: null },
        }),
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: JSON.stringify({ 0: ['variables.file'] }),
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/operations|map/i);
  });
});
