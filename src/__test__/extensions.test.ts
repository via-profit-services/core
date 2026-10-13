import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import type { InitProps, LimitsUsage, Middleware, UploadedFile } from '@via-profit-services/core';

import {
  graphqlHTTPFactory,
  setExtension,
  getRequestId,
  FileUploadScalarType,
  RESERVED_EXTENSIONS,
} from '../index';
import { fakeRequest, fakeResponse, jsonRequest, sleep } from './helpers';

const itemsField = () => ({
  type: new GraphQLList(Item),
  args: { first: { type: GraphQLInt } },
  resolve: (_parent: unknown, args: { first?: number }) =>
    Array.from({ length: args.first ?? 1 }, () => ({})),
});

const Item: GraphQLObjectType = new GraphQLObjectType({
  name: 'Item',
  fields: () => ({
    id: { type: GraphQLString, resolve: () => '1' },
    items: itemsField(),
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ok: { type: GraphQLString, resolve: () => 'ok' },
      items: itemsField(),
      requestId: { type: GraphQLString, resolve: (_p, _a, context) => getRequestId(context) },
      tagged: {
        type: GraphQLString,
        args: { tag: { type: GraphQLString }, delay: { type: GraphQLInt } },
        resolve: async (_p, args: { tag: string; delay?: number }, context) => {
          await sleep(args.delay ?? 0);
          setExtension(context, 'tag', args.tag);

          return args.tag;
        },
      },
      reserved: {
        type: GraphQLString,
        resolve: (_p, _a, context) => {
          setExtension(context, 'requestId', 'fake');

          return 'never';
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      upload: {
        type: GraphQLInt,
        args: { files: { type: new GraphQLList(new GraphQLNonNull(FileUploadScalarType)) } },
        resolve: async (_p, args: { files: UploadedFile[] }) => (await Promise.all(args.files)).length,
      },
    },
  }),
});

const listener = (props: Partial<InitProps> = {}) => graphqlHTTPFactory({ schema, ...props });

const run = (props: Partial<InitProps>, query: string, headers: Record<string, string> = {}) =>
  listener(props)(jsonRequest({ query }, headers), fakeResponse());

describe('requestId', () => {
  test('a random UUID, the same value as getRequestId() in resolvers', async () => {
    const res = await run({}, '{ requestId }');

    expect(res.extensions?.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.data?.requestId).toBe(res.extensions?.requestId);
  });

  test('X-Request-Id of a proxy is reused when it is a safe string', async () => {
    const safe = await run({}, '{ ok }', { 'x-request-id': 'nginx-7f3a:01' });
    const injected = await run({}, '{ ok }', { 'x-request-id': 'a\r\nFAKE LOG LINE' });
    const long = await run({}, '{ ok }', { 'x-request-id': 'x'.repeat(129) });

    expect(safe.extensions?.requestId).toBe('nginx-7f3a:01');
    expect(injected.extensions?.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(long.extensions?.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('Fields of the project', () => {
  test('setExtension in a resolver: sent without debug', async () => {
    const res = await run({}, '{ tagged(tag: "a") }');

    expect(res.extensions).toEqual({ requestId: expect.any(String), tag: 'a' });
  });

  test('a middleware writes to its `extensions`: sent without debug, core fields win', async () => {
    const middleware: Middleware = ({ extensions }) => {
      extensions.cache = 'stale';
      extensions.requestId = 'fake';
    };
    const res = await run({ middleware }, '{ ok }');

    expect(res.extensions?.cache).toBe('stale');
    expect(res.extensions?.requestId).not.toBe('fake');
  });

  test('a reserved name is refused', async () => {
    const res = await run({}, '{ reserved }');

    expect(res.errors?.[0]?.message).toBe('The extensions field «requestId» is reserved by the core');
    expect(RESERVED_EXTENSIONS).toContain('limits');
  });

  test('concurrent requests do not mix their fields', async () => {
    const handler = listener();
    const [slow, fast] = await Promise.all([
      handler(jsonRequest({ query: '{ tagged(tag: "slow", delay: 30) }' }), fakeResponse()),
      handler(jsonRequest({ query: '{ tagged(tag: "fast") }' }), fakeResponse()),
    ]);

    expect(slow.extensions?.tag).toBe('slow');
    expect(fast.extensions?.tag).toBe('fast');
  });

  test('sharedContext is not supported by setExtension', async () => {
    const res = await run({ sharedContext: true }, '{ tagged(tag: "a") }');

    expect(res.errors?.[0]?.message).toMatch(/sharedContext: true is not supported/);
  });

  test('outside of a request', () => {
    expect(() => setExtension({}, 'x', 1)).toThrow(/does not belong to a request/);
    expect(getRequestId({})).toBeUndefined();
  });
});

describe('Usage of the limits', () => {
  const query = '{ items(first: 10) { id items(first: 5) { id } } }';

  test('exposeUsage: measured values and the limits', async () => {
    const res = await run({ limits: { exposeUsage: true } }, query);
    const body = JSON.stringify({ query });

    expect(res.extensions?.limits).toEqual({
      operationName: null,
      bodySize: { value: Buffer.byteLength(body), max: 1024 * 1024 },
      tokens: { value: 20, max: 10_000 },
      depth: { value: 2, max: 20 },
      // items: (1 + id 1 + items (1 + 1) * 5) * 10 = 120
      complexity: { value: 120, max: 50_000 },
      width: { value: 2, max: 50 },
    });
    // nothing of the debug mode
    expect(res.extensions).not.toHaveProperty('diagnostics');
  });

  test('the token count is the one the parser checks against maxGraphQLTokens', async () => {
    const exact = await run({ limits: { maxGraphQLTokens: 20 } }, query);
    const less = await run({ limits: { maxGraphQLTokens: 19 } }, query);

    expect(exact.errors).toBeUndefined();
    expect(less.errors?.[0]?.message).toMatch(/more that 19 tokens/);
  });

  test('a disabled limit is still measured, its max is null', async () => {
    const res = await run(
      { limits: { exposeUsage: true, maxGraphQLDepthLimit: 0, complexityLimit: { maxComplexity: 0 } } },
      query,
    );

    expect(res.extensions?.limits).toMatchObject({
      depth: { value: 2, max: null },
      complexity: { value: 120, max: null },
      width: { value: 2, max: null },
    });
  });

  test('a rejected request reports how much it exceeded', async () => {
    const res = await run({ limits: { exposeUsage: true, maxGraphQLDepthLimit: 1 } }, query);

    expect(res.errors?.[0]?.message).toMatch(/too deeply nested/);
    expect(res.extensions?.limits).toMatchObject({ depth: { value: 2, max: 1 } });
  });

  test('onUsage works without exposing anything; its errors go to onError', async () => {
    const seen: [LimitsUsage, unknown][] = [];
    const errors: Error[] = [];
    const handler = listener({
      middleware: ({ context }) => {
        Object.assign(context, { user: 'u1' });
      },
      limits: {
        onUsage: (usage, context) => {
          seen.push([usage, context]);
          throw new Error('metrics are down');
        },
      },
      onError: err => errors.push(err),
    });

    const res = await handler(jsonRequest({ query, operationName: null }), fakeResponse());

    expect(res.errors).toBeUndefined();
    expect(res.extensions).toEqual({ requestId: expect.any(String) });
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toMatchObject({ depth: { value: 2, max: 20 }, complexity: { value: 120 } });
    expect(seen[0][1]).toEqual({ user: 'u1' });
    expect(errors.map(e => e.message)).toEqual(['metrics are down']);
  });

  test('uploads: number of files and their total size', async () => {
    const boundary = 'usage';
    const part = (headers: string, body: string) => `--${boundary}\r\n${headers}\r\n\r\n${body}\r\n`;
    const body =
      part(
        'Content-Disposition: form-data; name="operations"',
        JSON.stringify({ query: 'mutation($f: [FileUpload!]) { upload(files: $f) }', variables: { f: [null, null] } }),
      ) +
      part('Content-Disposition: form-data; name="map"', JSON.stringify({ 0: ['variables.f.0'], 1: ['variables.f.1'] })) +
      part('Content-Disposition: form-data; name="0"; filename="a.txt"', 'abc') +
      part('Content-Disposition: form-data; name="1"; filename="b.txt"', 'defgh') +
      `--${boundary}--\r\n`;

    const res = await listener({ limits: { exposeUsage: true } })(
      fakeRequest({ headers: { 'content-type': `multipart/form-data; boundary=${boundary}` }, chunks: [body] }),
      fakeResponse(),
    );

    expect(res.data).toEqual({ upload: 2 });
    expect(res.extensions?.limits).toMatchObject({
      files: { value: 2, max: 20 },
      filesTotalSize: { value: 8, max: 200 * 1024 * 1024 },
    });
    expect(res.extensions?.limits).not.toHaveProperty('bodySize');
  });
});

describe('debug', () => {
  test('diagnostics: operation, document cache, timing of the steps', async () => {
    const handler = listener({ debug: true });
    const request = () =>
      handler(jsonRequest({ query: 'query Q { ok }', operationName: 'Q' }), fakeResponse());

    const first = await request();
    const second = await request();

    expect(first.extensions?.diagnostics).toMatchObject({
      operationName: 'Q',
      persisted: false,
      documentCache: 'miss',
    });
    expect(second.extensions?.diagnostics?.documentCache).toBe('hit');
    expect(Object.keys(first.extensions?.diagnostics?.timing ?? {}).sort()).toEqual(
      ['body', 'document', 'execution', 'middlewares', 'validation'],
    );
    expect(first.extensions?.limits).toMatchObject({ operationName: 'Q', depth: { value: 0 } });
    expect(first.extensions).toMatchObject({ requestCounter: 1, queryTime: expect.any(Number) });
  });

  test('requestCounter is the number of this request, also for concurrent requests', async () => {
    const handler = listener({ debug: true });
    const responses = await Promise.all(
      [30, 0, 10].map(delay =>
        handler(jsonRequest({ query: `{ tagged(tag: "t", delay: ${delay}) }` }), fakeResponse()),
      ),
    );

    // the old code returned the counter at the end of every request: 3, 3, 3
    expect(responses.map(r => r.extensions?.requestCounter)).toEqual([1, 2, 3]);
  });

  test('an error response gets extensions too', async () => {
    const res = await run({ debug: true }, '{ unknown }');

    expect(res.errors?.[0]).toBeDefined();
    expect(res.extensions).toMatchObject({ requestId: expect.any(String), requestCounter: 1 });
  });
});

describe('Other errors are not affected', () => {
  test('GraphQLError of a middleware still has its status', async () => {
    const middleware: Middleware = () => {
      throw new GraphQLError('Nope', { extensions: { code: 'FORBIDDEN' } });
    };
    const res = await run({ middleware }, '{ ok }');

    expect(res.status).toBe(403);
    expect(res.extensions?.requestId).toEqual(expect.any(String));
  });
});
