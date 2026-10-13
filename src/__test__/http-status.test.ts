import zlib from 'node:zlib';
import type http from 'node:http';
import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { graphqlHTTPFactory, FileUploadScalarType } from '../index';
import { fakeRequest, fakeResponse, jsonRequest } from './helpers';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ok: { type: GraphQLString, resolve: () => 'ok' },
      list: {
        type: new GraphQLList(GraphQLString),
        args: { first: { type: GraphQLInt } },
        resolve: () => [],
      },
      fails: {
        type: GraphQLString,
        resolve: () => {
          throw new Error('boom');
        },
      },
      failsNonNull: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => {
          throw new GraphQLError('denied', {
            extensions: { code: 'FORBIDDEN', http: { status: 403 } },
          });
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      m: { type: GraphQLString },
      upload: {
        type: GraphQLString,
        args: { f: { type: FileUploadScalarType } },
        resolve: () => 'ok',
      },
    },
  }),
});

const multipart = (body: string, boundary = 'b') =>
  fakeRequest({
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    chunks: [body],
  });

const uploadBody = (file: string) =>
  [
    '--b',
    'Content-Disposition: form-data; name="operations"',
    '',
    '{"query":"mutation($f: FileUpload) { upload(f: $f) }","variables":{"f":null}}',
    '--b',
    'Content-Disposition: form-data; name="map"',
    '',
    '{"0":["variables.f"]}',
    '--b',
    'Content-Disposition: form-data; name="0"; filename="a.txt"',
    '',
    file,
    '--b--',
    '',
  ].join('\r\n');

describe('response.status', () => {
  const listener = graphqlHTTPFactory({
    schema,
    limits: { maxJSONBodySize: 1000, maxFileSize: 10, complexityLimit: { maxComplexity: 100 } },
    middleware: ({ request }) => {
      const auth = request.headers['x-auth'];
      if (auth === 'none') {
        throw new GraphQLError('Invalid token', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (auth === 'teapot') {
        throw new GraphQLError('I am a teapot', { extensions: { http: { status: 418 } } });
      }
      if (auth === 'proto') {
        throw new GraphQLError('Prototype key as a code', { extensions: { code: 'toString' } });
      }
      if (auth === 'crash') {
        throw new Error('redis is down');
      }
    },
  });

  test.each<[string, http.IncomingMessage, number]>([
    ['success', jsonRequest({ query: '{ ok }' }), 200],
    ['partial success: resolver error with data', jsonRequest({ query: '{ ok fails }' }), 200],
    ['data: null after a non-null field error', jsonRequest({ query: '{ failsNonNull }' }), 200],
    [
      'invalid JSON',
      fakeRequest({ headers: { 'content-type': 'application/json' }, chunks: ['{oops'] }),
      400,
    ],
    ['empty request', jsonRequest({}), 400],
    ['syntax error', jsonRequest({ query: '{ ok' }), 400],
    ['validation error', jsonRequest({ query: '{ unknown }' }), 400],
    ['complexity limit', jsonRequest({ query: '{ list(first: 1000) }' }), 400],
    [
      'invalid variable value',
      jsonRequest({ query: 'query($n: Int) { list(first: $n) }', variables: { n: 'x' } }),
      400,
    ],
    ['variables not an object', jsonRequest({ query: '{ ok }', variables: [1] }), 400],
    [
      'middleware: UNAUTHENTICATED code',
      jsonRequest({ query: '{ ok }' }, { 'x-auth': 'none' }),
      401,
    ],
    [
      'middleware: explicit extensions.http.status',
      jsonRequest({ query: '{ ok }' }, { 'x-auth': 'teapot' }),
      418,
    ],
    [
      'middleware: code that matches an Object.prototype key',
      jsonRequest({ query: '{ ok }' }, { 'x-auth': 'proto' }),
      400,
    ],
    ['middleware: unexpected error', jsonRequest({ query: '{ ok }' }, { 'x-auth': 'crash' }), 500],
    [
      'unsupported method',
      fakeRequest({ method: 'PUT', headers: { 'content-type': 'application/json' } }),
      405,
    ],
    [
      'mutation via GET',
      fakeRequest({ method: 'GET', url: `/?query=${encodeURIComponent('mutation { m }')}` }),
      405,
    ],
    [
      'unsupported content-type',
      fakeRequest({ headers: { 'content-type': 'text/plain' }, chunks: ['{}'] }),
      415,
    ],
    [
      'unsupported content-encoding',
      jsonRequest({ query: '{ ok }' }, { 'content-encoding': 'zstd' }),
      415,
    ],
    ['JSON body too large', jsonRequest({ query: `{ ok } # ${'x'.repeat(2000)}` }), 413],
    [
      'decompressed body too large',
      fakeRequest({
        headers: { 'content-type': 'application/json', 'content-encoding': 'gzip' },
        chunks: [zlib.gzipSync(Buffer.alloc(10 * 1024 * 1024, 0x20))],
      }),
      413,
    ],
    ['file too large', multipart(uploadBody('x'.repeat(100))), 413],
    ['upload success', multipart(uploadBody('small')), 200],
    ['malformed multipart', multipart('--b\nbroken\n--b--\n'), 400],
  ])('%s', async (_name, request, status) => {
    const response = await listener(request, fakeResponse());
    expect(response.status).toBe(status);
  });

  test('status is not part of the serialized body', async () => {
    const response = await listener(jsonRequest({ query: '{ ok }' }), fakeResponse());

    expect(response.status).toBe(200);
    expect(JSON.parse(JSON.stringify(response))).toEqual({ data: { ok: 'ok' } });
    expect({ ...response }).not.toHaveProperty('status');
    expect(Object.keys(response)).not.toContain('status');
  });

  test('extensions.http is used for the status but not sent to the client', async () => {
    const teapot = await listener(
      jsonRequest({ query: '{ ok }' }, { 'x-auth': 'teapot' }),
      fakeResponse(),
    );
    expect(teapot.errors?.[0]?.extensions).toBeUndefined();

    const forbidden = await listener(jsonRequest({ query: '{ failsNonNull }' }), fakeResponse());
    expect(forbidden.errors?.[0]?.extensions).toEqual({ code: 'FORBIDDEN' });
  });
});
