import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import type http from 'node:http';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import type { UploadedFile, Limits } from '@via-profit-services/core';

import { graphqlHTTPFactory, FileUploadScalarType } from '../index';
import { fakeRequest, fakeResponse } from './helpers';
import { Multipart } from '../utils/Multipart';

const FileInfo = new GraphQLObjectType({
  name: 'FileInfo',
  fields: {
    filename: { type: GraphQLString },
    mimeType: { type: GraphQLString },
    fileSize: { type: GraphQLInt },
    readSize: { type: GraphQLInt },
    sha256: { type: GraphQLString },
  },
});

const readFile = async (upload: UploadedFile) => {
  const file = await upload;
  const hash = crypto.createHash('sha256');
  let readSize = 0;

  for await (const chunk of file.createReadStream()) {
    hash.update(chunk as Buffer);
    readSize += (chunk as Buffer).length;
  }

  return {
    filename: file.filename,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    readSize,
    sha256: hash.digest('hex'),
  };
};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: { ping: { type: GraphQLString, resolve: () => 'pong' } },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      upload: {
        type: FileInfo,
        args: { file: { type: new GraphQLNonNull(FileUploadScalarType) } },
        resolve: (_parent, args: { file: UploadedFile }) => readFile(args.file),
      },
      uploadMany: {
        type: new GraphQLList(FileInfo),
        args: { files: { type: new GraphQLList(new GraphQLNonNull(FileUploadScalarType)) } },
        resolve: (_parent, args: { files: UploadedFile[] }) => Promise.all(args.files.map(readFile)),
      },
    },
  }),
});

const UPLOAD_ONE = 'mutation($file: FileUpload!) { upload(file: $file) { filename mimeType fileSize readSize sha256 } }';
const sha256 = (data: Buffer) => crypto.createHash('sha256').update(data).digest('hex');

type Part = { name: string; filename?: string; contentType?: string; body: Buffer | string; rawDisposition?: string };

const buildBody = (boundary: string, parts: Part[]) => {
  const chunks: Buffer[] = [];
  for (const part of parts) {
    const disposition =
      part.rawDisposition ??
      `form-data; name="${part.name}"${typeof part.filename === 'string' ? `; filename="${part.filename}"` : ''}`;
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: ${disposition}\r\n`));
    if (part.contentType) {
      chunks.push(Buffer.from(`Content-Type: ${part.contentType}\r\n`));
    }
    chunks.push(Buffer.from('\r\n'));
    chunks.push(Buffer.isBuffer(part.body) ? part.body : Buffer.from(part.body));
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return Buffer.concat(chunks);
};

const singleFileBody = (boundary: string, file: Buffer, filename = 'file.bin') =>
  buildBody(boundary, [
    { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
    { name: 'map', body: JSON.stringify({ 0: ['variables.file'] }) },
    { name: '0', filename, contentType: 'application/octet-stream', body: file },
  ]);

const multipartRequest = (boundary: string, chunks: Array<Buffer | string>, contentType?: string) =>
  fakeRequest({
    headers: { 'content-type': contentType ?? `multipart/form-data; boundary=${boundary}` },
    chunks,
  });

const listTempFiles = () =>
  fs.readdirSync(os.tmpdir()).filter(name => name.startsWith('via-profit-upload-'));

const waitFor = async (condition: () => boolean, timeout = 2000) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('waitFor: timeout');
    }
    await new Promise(r => setTimeout(r, 10));
  }
};

describe('File uploads', () => {
  const listener = graphqlHTTPFactory({ schema });

  test('a delimiter split at ANY position between two chunks is handled', async () => {
    const boundary = '----split-test';
    // the file contains CRLF and boundary-like bytes on purpose
    const file = Buffer.from(`line1\r\n--${boundary.slice(0, 6)}\r\n-${boundary}x\r\n--end`);
    const body = singleFileBody(boundary, file);

    for (let cut = 1; cut < body.length; cut++) {
      const res = await listener(
        multipartRequest(boundary, [body.subarray(0, cut), body.subarray(cut)]),
        fakeResponse(),
      );

      expect({ cut, errors: res.errors }).toEqual({ cut, errors: undefined });
      expect(res.data?.upload).toMatchObject({ sha256: sha256(file), fileSize: file.length });
    }
  });

  test('a body sent byte by byte is handled', async () => {
    const boundary = 'b';
    // "\r\n--b" must not appear in the data: it is the delimiter itself
    const file = Buffer.from('a\r\n-b\r\n--\r\n-b-');
    const body = singleFileBody(boundary, file);
    const bytes = Array.from(body).map(byte => Buffer.from([byte]));

    const res = await listener(multipartRequest(boundary, bytes), fakeResponse());

    expect(res.errors).toBeUndefined();
    expect(res.data?.upload).toMatchObject({ sha256: sha256(file) });
  });

  test('binary data with every byte value arrives unchanged', async () => {
    const boundary = `----binary-${crypto.randomUUID()}`;
    const file = crypto.randomBytes(300_000);
    // almost-delimiters: CRLF + "--" + a prefix of the boundary
    file.write(`\r\n--${boundary.slice(0, 20)}`, 1000, 'latin1');
    file.write(`\r\n--${boundary.slice(0, -1)}`, 150_000, 'latin1');
    const body = singleFileBody(boundary, file);

    // split into random-sized chunks
    const chunks: Buffer[] = [];
    for (let offset = 0; offset < body.length; ) {
      const size = 1 + Math.floor(Math.random() * 70_000);
      chunks.push(body.subarray(offset, offset + size));
      offset += size;
    }

    const res = await listener(multipartRequest(boundary, chunks), fakeResponse());

    expect(res.errors).toBeUndefined();
    expect(res.data?.upload).toMatchObject({ sha256: sha256(file), readSize: file.length });
  });

  test('several files in one request', async () => {
    const boundary = 'many';
    const files = [Buffer.from('first'), Buffer.from(''), crypto.randomBytes(10_000)];
    const body = buildBody(boundary, [
      {
        name: 'operations',
        body: JSON.stringify({
          query: 'mutation($files: [FileUpload!]) { uploadMany(files: $files) { sha256 fileSize } }',
          variables: { files: [null, null, null] },
        }),
      },
      { name: 'map', body: JSON.stringify({ a: ['variables.files.0'], b: ['variables.files.1'], c: ['variables.files.2'] }) },
      { name: 'a', filename: 'a.txt', body: files[0] },
      { name: 'b', filename: 'b.txt', body: files[1] },
      { name: 'c', filename: 'c.bin', body: files[2] },
    ]);

    const res = await listener(multipartRequest(boundary, [body]), fakeResponse());

    expect(res.errors).toBeUndefined();
    expect(res.data?.uploadMany).toEqual(files.map(f => ({ sha256: sha256(f), fileSize: f.length })));
  });

  test('file metadata: quoted boundary, case-insensitive type, filename* and paths', async () => {
    const boundary = 'abc:def=?';
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: 'map', body: JSON.stringify({ 0: ['variables.file'] }) },
      {
        name: '0',
        rawDisposition: `form-data; name="0"; filename="C:\\\\Users\\\\me\\\\fallback.png"; filename*=UTF-8''%D1%84%D0%BE%D1%82%D0%BE.png`,
        contentType: 'Image/PNG; charset=binary',
        body: 'png',
      },
    ]);

    const res = await listener(
      multipartRequest(boundary, [body], `Multipart/Form-Data; boundary="${boundary}"`),
      fakeResponse(),
    );

    expect(res.errors).toBeUndefined();
    expect(res.data?.upload).toMatchObject({ filename: 'фото.png', mimeType: 'image/png' });
  });

  test('a file path in filename is reduced to the base name', async () => {
    const boundary = 'path';
    const body = singleFileBody(boundary, Buffer.from('x'), '../../etc/passwd');
    const res = await listener(multipartRequest(boundary, [body]), fakeResponse());

    expect(res.data?.upload).toMatchObject({ filename: 'passwd' });
  });
});

describe('File uploads: errors never hang', () => {
  const listener = graphqlHTTPFactory({ schema });

  const expectError = async (request: http.IncomingMessage, message: RegExp) => {
    const res = await Promise.race([
      listener(request, fakeResponse()),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('request hangs')), 3000)),
    ]);

    expect(res.data).toBeUndefined();
    expect(res.errors?.[0]?.message).toMatch(message);
  };

  test('map references a file that was not sent', async () => {
    const boundary = 'missing';
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: 'map', body: JSON.stringify({ 0: ['variables.file'] }) },
    ]);

    await expectError(multipartRequest(boundary, [body]), /«0».*not received/);
  });

  test('a file that is not in map', async () => {
    const boundary = 'unknown';
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: 'map', body: JSON.stringify({ 0: ['variables.file'] }) },
      { name: '1', filename: 'x', body: 'x' },
    ]);

    await expectError(multipartRequest(boundary, [body]), /not referenced/);
  });

  test('a file before map', async () => {
    const boundary = 'order';
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: '0', filename: 'x', body: 'x' },
      { name: 'map', body: JSON.stringify({ 0: ['variables.file'] }) },
    ]);

    await expectError(multipartRequest(boundary, [body]), /after the «map»/);
  });

  test('the closing boundary is missing', async () => {
    const boundary = 'unfinished';
    const body = singleFileBody(boundary, Buffer.from('data'));
    const truncated = body.subarray(0, body.length - `--${boundary}--\r\n`.length - 10);

    await expectError(multipartRequest(boundary, [truncated]), /closing boundary is missing/);
  });

  test('operations is not a JSON object', async () => {
    for (const value of ['null', '[]', '42', '{oops']) {
      const boundary = 'ops';
      const body = buildBody(boundary, [{ name: 'operations', body: value }]);

      await expectError(multipartRequest(boundary, [body]), /operations/i);
    }
  });

  test('the client aborts the request', async () => {
    const boundary = 'abort';
    const body = singleFileBody(boundary, crypto.randomBytes(100_000));
    const request = Readable.from(
      (async function* () {
        yield body.subarray(0, 50_000);
        await new Promise(r => setTimeout(r, 20));
        throw new Error('socket hang up');
      })(),
    ) as unknown as http.IncomingMessage;
    Object.assign(request, {
      method: 'POST',
      url: '/',
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    await expectError(request, /socket hang up|aborted/);
  });
});

describe('File uploads: limits are enforced while streaming', () => {
  const makeLargeRequest = (boundary: string, totalMb: number) => {
    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n${JSON.stringify({
        query: UPLOAD_ONE,
        variables: { file: null },
      })}\r\n--${boundary}\r\nContent-Disposition: form-data; name="map"\r\n\r\n{"0":["variables.file"]}\r\n--${boundary}\r\nContent-Disposition: form-data; name="0"; filename="big.bin"\r\n\r\n`,
    );
    const chunk = Buffer.alloc(1024 * 1024, 0x41);
    const stats = { sentMb: 0 };

    const request = Readable.from(
      (function* () {
        yield head;
        for (let i = 0; i < totalMb; i++) {
          stats.sentMb += 1;
          yield chunk;
        }
        yield Buffer.from(`\r\n--${boundary}--\r\n`);
      })(),
    ) as unknown as http.IncomingMessage;
    Object.assign(request, {
      method: 'POST',
      url: '/',
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    });

    return { request, stats };
  };

  const run = async (limits: Limits, totalMb: number) => {
    const listener = graphqlHTTPFactory({ schema, limits });
    const { request, stats } = makeLargeRequest('large', totalMb);
    const res = await listener(request, fakeResponse());

    return { res, stats };
  };

  test('maxFileSize rejects the request as soon as the limit is exceeded', async () => {
    const { res, stats } = await run({ maxFileSize: 1024 }, 100);

    expect(res.errors?.[0]?.message).toMatch(/exceeds the 1024 byte size limit/);
    // the old parser read (and kept in memory) all 100 MB before checking limits
    expect(stats.sentMb).toBeLessThan(5);
  });

  test('maxFilesTotalSize', async () => {
    const { res } = await run({ maxFilesTotalSize: 2 * 1024 * 1024 }, 5);
    expect(res.errors?.[0]?.message).toMatch(/Total upload size exceeds/);
  });

  test('maxFiles, maxFileFields and maxFileParts', async () => {
    const listener = graphqlHTTPFactory({ schema, limits: { maxFiles: 1, maxFileFields: 2, maxFileParts: 3 } });
    const boundary = 'limits';

    const tooManyFiles = buildBody(boundary, [
      {
        name: 'operations',
        body: JSON.stringify({
          query: 'mutation($files: [FileUpload!]) { uploadMany(files: $files) { sha256 } }',
          variables: { files: [null, null] },
        }),
      },
      { name: 'map', body: JSON.stringify({ 0: ['variables.files.0'], 1: ['variables.files.1'] }) },
      { name: '0', filename: 'a', body: 'a' },
      { name: '1', filename: 'b', body: 'b' },
    ]);
    const res1 = await listener(multipartRequest(boundary, [tooManyFiles]), fakeResponse());
    expect(res1.errors?.[0]?.message).toMatch(/limit of 1 files|limit of 3 parts/);

    const tooManyFields = buildBody(boundary, [
      { name: 'operations', body: '{"query":"{ ping }"}' },
      { name: 'x', body: '1' },
      { name: 'y', body: '2' },
    ]);
    const res2 = await listener(multipartRequest(boundary, [tooManyFields]), fakeResponse());
    expect(res2.errors?.[0]?.message).toMatch(/limit of 2 non-file field parts/);
  });

  test('a 64 MB file is streamed to disk', async () => {
    const { res } = await run({ maxFileSize: 100 * 1024 * 1024, maxFilesTotalSize: 100 * 1024 * 1024 }, 64);

    expect(res.errors).toBeUndefined();
    expect(res.data?.upload).toMatchObject({ fileSize: 64 * 1024 * 1024, readSize: 64 * 1024 * 1024 });
  });

  test('backpressure: the parser stops reading while the file is not consumed', async () => {
    const boundary = 'slow';
    const parser = new Multipart(boundary, {
      fieldSize: 1024,
      fileSize: Infinity,
      filesTotalSize: Infinity,
      files: 1,
      fields: 2,
      parts: 3,
      headerSize: 1024,
    });
    let fileStream: Readable | null = null;
    parser.on('file', (_name: string, stream: Readable) => {
      fileStream = stream; // nobody reads it yet
    });

    const { request, stats } = makeLargeRequest(boundary, 20);
    const finished = new Promise(resolve => parser.on('finish', resolve));
    request.pipe(parser);

    await new Promise(r => setTimeout(r, 200));
    expect(stats.sentMb).toBeLessThan(5);

    // the consumer starts reading: the rest of the body flows
    let received = 0;
    fileStream!.on('data', (chunk: Buffer) => {
      received += chunk.length;
    });
    await finished;
    expect(stats.sentMb).toBe(20);
    await waitFor(() => received === 20 * 1024 * 1024);
  });
});

describe('File uploads: security', () => {
  const listener = graphqlHTTPFactory({ schema });

  test.each([
    'variables.__proto__.toString',
    'variables.__proto__.polluted',
    'variables.constructor.prototype.polluted',
    'variables.file.__proto__',
    '__proto__.polluted',
    'query',
  ])('map path «%s» is rejected and Object.prototype stays intact', async mapPath => {
    const originalToString = Object.prototype.toString;
    const boundary = 'proto';
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: 'map', body: JSON.stringify({ 0: [mapPath] }) },
      { name: '0', filename: 'a.txt', body: 'a' },
    ]);

    const res = await listener(multipartRequest(boundary, [body]), fakeResponse());

    expect(res.errors?.[0]?.message).toMatch(/Invalid map path/);
    expect(Object.prototype.toString).toBe(originalToString);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  test('temporary files are removed when the HTTP response is closed', async () => {
    const boundary = 'cleanup';
    const before = listTempFiles().length;
    const response = new EventEmitter() as unknown as http.ServerResponse;

    const res = await listener(multipartRequest(boundary, [singleFileBody(boundary, Buffer.from('tmp'))]), response);
    expect(res.errors).toBeUndefined();
    expect(listTempFiles().length).toBe(before + 1);

    (response as unknown as EventEmitter).emit('close');
    await waitFor(() => listTempFiles().length === before);
  });

  test('temporary files are removed after execution without a real response', async () => {
    const boundary = 'cleanup2';
    const before = listTempFiles().length;

    await listener(multipartRequest(boundary, [singleFileBody(boundary, Buffer.from('tmp'))]), fakeResponse());
    await waitFor(() => listTempFiles().length === before);
  });

  test('temporary files are removed when the request fails', async () => {
    const boundary = 'cleanup3';
    const before = listTempFiles().length;
    const body = buildBody(boundary, [
      { name: 'operations', body: JSON.stringify({ query: UPLOAD_ONE, variables: { file: null } }) },
      { name: 'map', body: JSON.stringify({ 0: ['variables.file'], 1: ['variables.file'] }) },
      { name: '0', filename: 'a.txt', body: 'a' },
    ]);

    const res = await listener(multipartRequest(boundary, [body]), fakeResponse());
    expect(res.errors?.[0]?.message).toMatch(/not received/);
    await waitFor(() => listTempFiles().length === before);
  });

  test('temporary files are created with 0600 permissions', async () => {
    const boundary = 'mode';
    const response = new EventEmitter() as unknown as http.ServerResponse;
    const before = new Set(listTempFiles());

    await listener(multipartRequest(boundary, [singleFileBody(boundary, Buffer.from('secret'))]), response);
    const created = listTempFiles().filter(name => !before.has(name));

    expect(created).toHaveLength(1);
    expect(fs.statSync(path.join(os.tmpdir(), created[0])).mode & 0o777).toBe(0o600);
    (response as unknown as EventEmitter).emit('close');
  });
});
