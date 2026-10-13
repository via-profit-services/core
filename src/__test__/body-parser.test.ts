import zlib from 'node:zlib';
import { Readable } from 'node:stream';
import type http from 'node:http';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { graphqlHTTPFactory } from '../index';
import { fakeRequest, fakeResponse } from './helpers';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      echo: {
        type: GraphQLString,
        args: { str: { type: GraphQLString } },
        resolve: (_parent, args) => args.str ?? 'pong',
      },
    },
  }),
});

const listener = graphqlHTTPFactory({ schema });

const send = (body: Buffer | string, headers: Record<string, string> = {}, method = 'POST', url = '/graphql') =>
  listener(
    fakeRequest({ method, url, headers: { 'content-type': 'application/json', ...headers }, chunks: [body] }),
    fakeResponse(),
  );

const firstError = (res: { errors?: readonly { message: string }[] | null }) => res.errors?.[0]?.message;

describe('Body parser', () => {
  test('invalid JSON is reported, not replaced by an empty request', async () => {
    const res = await send('{"query": "{ echo }", "variables": invalid}');
    expect(firstError(res)).toMatch(/not valid JSON/);
  });

  test('batched (array) requests are rejected explicitly', async () => {
    const res = await send('[{"query":"{ echo }"}]');
    expect(firstError(res)).toMatch(/Batched operations are not supported/);
  });

  test.each([
    ['array', [1, 2]],
    ['number', 42],
    ['string with invalid JSON', '{oops'],
    ['string with a JSON array', '[1]'],
  ])('variables as %s are rejected', async (_name, variables) => {
    const res = await send(JSON.stringify({ query: '{ echo }', variables }));
    expect(firstError(res)).toMatch(/Variables/);
  });

  test('media type and parameters are parsed case-insensitively', async () => {
    const res = await send(JSON.stringify({ query: '{ echo }' }), {
      'content-type': 'Application/JSON; Charset=UTF-8',
    });
    expect(res.data).toEqual({ echo: 'pong' });
  });

  test('an unsupported content-type is reported with the original header', async () => {
    const res = await send('{}', { 'content-type': 'text/plain' });
    expect(firstError(res)).toBe(
      'Expected content-type: application/json or multipart/form-data. Got «text/plain»',
    );
  });

  test.each([
    ['gzip', zlib.gzipSync],
    ['deflate', zlib.deflateSync],
    ['br', zlib.brotliCompressSync],
  ])('%s encoded body', async (encoding, compress) => {
    const body = compress(Buffer.from(JSON.stringify({ query: '{ echo(str: "zip") }' })));
    const res = await send(body, { 'content-encoding': encoding as string });
    expect(res.data).toEqual({ echo: 'zip' });
  });

  test('gzip bomb is stopped by the decompressed size limit', async () => {
    const bomb = zlib.gzipSync(Buffer.alloc(50 * 1024 * 1024, 0x20)); // ~50 KB compressed
    const res = await send(bomb, { 'content-encoding': 'gzip' });
    expect(firstError(res)).toMatch(/Decompressed body exceeds/);
  });

  test('a broken gzip stream fails instead of hanging', async () => {
    const res = await send(Buffer.from('definitely not gzip'), { 'content-encoding': 'gzip' });
    expect(firstError(res)).toMatch(/Failed to read body/);
  });

  test('an aborted request fails instead of hanging', async () => {
    const request = Readable.from(
      (async function* () {
        yield Buffer.from('{"query":');
        throw new Error('socket hang up');
      })(),
    ) as unknown as http.IncomingMessage;
    Object.assign(request, { method: 'POST', url: '/', headers: { 'content-type': 'application/json' } });

    const res = await listener(request, fakeResponse());
    expect(firstError(res)).toMatch(/socket hang up|aborted/);
  });

  test('the body size limit is checked on the wire size without content-length', async () => {
    const small = graphqlHTTPFactory({ schema, limits: { maxJSONBodySize: 100 } });
    const res = await small(
      fakeRequest({
        headers: { 'content-type': 'application/json' },
        chunks: [JSON.stringify({ query: `{ echo(str: "${'x'.repeat(200)}") }` })],
      }),
      fakeResponse(),
    );
    expect(firstError(res)).toMatch(/exceeds maximum allowed size of 100 bytes/);
  });

  test('GET with query, variables and operationName in the URL', async () => {
    const url = `/graphql?query=${encodeURIComponent('query Q($s: String) { echo(str: $s) }')}&variables=${encodeURIComponent('{"s":"get"}')}&operationName=Q`;
    const res = await listener(fakeRequest({ method: 'GET', url }), fakeResponse());
    expect(res.data).toEqual({ echo: 'get' });
  });

  test('GET cannot run mutations', async () => {
    const withMutation = new GraphQLSchema({
      query: schema.getQueryType(),
      mutation: new GraphQLObjectType({ name: 'Mutation', fields: { m: { type: GraphQLString } } }),
    });
    const res = await graphqlHTTPFactory({ schema: withMutation })(
      fakeRequest({ method: 'GET', url: `/?query=${encodeURIComponent('mutation { m }')}` }),
      fakeResponse(),
    );
    expect(firstError(res)).toMatch(/Can only perform a mutation operation from a POST request/);
  });
});
