/**
 * SECURITY / ADVANCED SUITE
 * Covers:
 * 1. Boundary split attacks
 * 2. CRLF variations
 * 3. Binary boundary collisions
 * 4. Excessive multipart parts
 * 5. Map edge cases
 * 6. Ordering edge cases
 * 7. Filename edge cases
 * 8. TempFile edge cases
 * 9. GZIP bombs
 * 10. Header injection
 * 11. Invalid UTF‑8
 * 12. Huge variables
 * 13. Circular JSON
 */

import http from 'node:http';
import zlib from 'node:zlib';
import { TempFile } from '../utils/TempFile';

import configTest, { sendGraphQLRequest } from './config-test';
import schema from './schema';

const port = 8084;
const endpoint = '/graphql';

const { startServer, stopServer } = configTest({
  schema,
  port,
  endpoint,
  limits: {
    maxJSONBodySize: 2_000_000,
    maxFileSize: 1_000_000,
    maxFiles: 10,
    maxFileParts: 50,
    maxFilesTotalSize: 2_000_000,
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

describe('SECURITY / ADVANCED SUITE', () => {
  //
  // 1. BOUNDARY SPLIT ATTACK
  //
  test('1.1 Boundary split across chunks', done => {
    const boundary = '----split';
    const head = `--${boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{"query":"{ ping }","variables":{"file":null}}\r\n`;
    const mid = `--${boundary}\r\nContent-Disposition: form-data; name="map"\r\n\r\n{"0":["variables.file"]}\r\n`;

    // FIX: no leading CRLF here
    const tailPart1 = `\r\n--${boundary}\r\n`;

    // FIX: closing boundary MUST end with CRLF
    const tailPart2 = `Content-Disposition: form-data; name="0"; filename="a.txt"\r\nContent-Type: text/plain\r\n\r\nhello\r\n--${boundary}--\r\n`;

    const req = http.request(
      {
        method: 'POST',
        port,
        path: endpoint,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          console.log(body);
          expect(res.statusCode).toBe(200);
          expect(body).toMatch(/ping/i);
          done();
        });
      },
    );

    req.write(head);
    req.write(mid);
    req.write(tailPart1);
    req.write(tailPart2);
    req.end();
  });

  //
  // 2. CRLF VARIATIONS
  //
  test('2.1 Multipart with LF only', async () => {
    const boundary = '----lf';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="operations"',
      '',
      '{"query":"{ ping }","variables":{}}',
      `--${boundary}--`,
      '',
    ].join('\n'); // LF only

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatch(/ping/i);
  });

  //
  // 3. BINARY BOUNDARY COLLISION
  //
  test('3.1 File contains boundary-like bytes', async () => {
    const boundary = '----bin';
    const file = Buffer.from(`hello--${boundary}world`);

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"mutation ($f: Upload!) { upload(file: $f) }","variables":{"f":null}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.f"]}',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename="bin.txt"',
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
    expect(res.body).toMatch(/upload/i);
  });

  //
  // 4. EXCESSIVE PARTS
  //
  test('4.1 Too many parts', async () => {
    const boundary = '----many';
    const parts = [];

    parts.push({
      headers: ['Content-Disposition: form-data; name="operations"'],
      body: '{"query":"{ ping }","variables":{}}',
    });

    for (let i = 0; i < 100; i++) {
      parts.push({
        headers: [`Content-Disposition: form-data; name="f${i}"`],
        body: 'x',
      });
    }

    const body = mp(boundary, parts);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/parts/i);
  });

  //
  // 5. MAP EDGE CASES
  //
  test('5.1 Duplicate map keys', async () => {
    const boundary = '----dup';
    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"{ ping }","variables":{"a":null,"b":null}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.a"],"0":["variables.b"]}',
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

  test('5.2 Map references array index out of range', async () => {
    const boundary = '----range';
    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"{ ping }","variables":{"files":[]}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.files.10"]}',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/Invalid|path/i);
  });

  //
  // 6. ORDERING EDGE CASES
  //
  test('6.1 map → operations → file', async () => {
    const boundary = '----order';

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.file"]}',
      },
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"{ ping }","variables":{"file":null}}',
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
    expect(res.body).toMatch(/operations|map/i);
  });

  //
  // 7. FILENAME EDGE CASES
  //
  test('7.1 Empty filename', async () => {
    const boundary = '----empty';

    const body = mp(boundary, [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"mutation ($f: Upload!) { upload(file: $f) }","variables":{"f":null}}',
      },
      {
        headers: ['Content-Disposition: form-data; name="map"'],
        body: '{"0":["variables.f"]}',
      },
      {
        headers: [
          'Content-Disposition: form-data; name="0"; filename=""',
          'Content-Type: text/plain',
        ],
        body: 'abc',
      },
    ]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatch(/upload/i);
  });

  //
  // 8. TEMPFILE EDGE CASES
  //
  test('8.1 write after end', async () => {
    const tmp = new TempFile();
    tmp.write(Buffer.from('a'));
    await tmp.end();
    expect(() => tmp.write(Buffer.from('b'))).toThrow(/closed/i);
    tmp.cleanup();
  });

  test('8.2 cleanup before end', async () => {
    const tmp = new TempFile();
    tmp.write(Buffer.from('a'));
    tmp.cleanup();
    await tmp.end(); // must not throw
  });

  //
  // 9. GZIP BOMB
  //
  test('9.1 gzip bomb', async () => {
    const huge = Buffer.alloc(5_000_000, 0x41); // 5MB of 'A'
    const gz = zlib.gzipSync(huge);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: gz,
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'gzip',
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/decompressed/i);
  });

  //
  // 10. HEADER INJECTION
  //
  test('10.1 boundary header injection', async () => {
    const boundary = '----inj\r\nX-Hacked: yes';

    const body = mp('----inj', [
      {
        headers: ['Content-Disposition: form-data; name="operations"'],
        body: '{"query":"{ ping }","variables":{}}',
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
    expect(res.body).toMatch(/boundary/i);
  });

  //
  // 11. INVALID UTF‑8
  //
  test('11.1 invalid UTF‑8 body', async () => {
    const bad = Buffer.from([0xff, 0xfe, 0xfd]);

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body: bad,
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });

  //
  // 12. HUGE VARIABLES
  //
  test('12.1 huge variables object', async () => {
    const big = 'x'.repeat(1_500_000);
    const body = JSON.stringify({ query: '{ ping }', variables: { big } });

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatch(/exceeds/i);
  });

  //
  // 13. CIRCULAR JSON
  //
  test('13.1 circular JSON in variables', async () => {
    const obj: any = { a: {} };
    obj.a.self = obj;

    let body = '';
    try {
      body = JSON.stringify({ query: '{ ping }', variables: obj });
    } catch {
      body = '{"query":"{ ping }","variables":{}}';
    }

    const res = await sendGraphQLRequest({
      port,
      endpoint,
      body,
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });
});
