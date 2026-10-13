import { GraphQLError, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import type { InitProps } from '@via-profit-services/core';

import { graphqlHTTPFactory, DateTimeScalarType } from '../index';
import { fakeRequest, fakeResponse, jsonRequest } from './helpers';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ok: { type: GraphQLString, resolve: () => 'ok' },
      dbError: {
        type: GraphQLString,
        resolve: () => {
          throw new Error('relation "users" does not exist at pg://admin:secret@10.0.0.5/db');
        },
      },
      forbidden: {
        type: GraphQLString,
        resolve: () => {
          throw new GraphQLError('Access denied', { extensions: { code: 'FORBIDDEN' } });
        },
      },
    },
  }),
});

const run = (props: Partial<InitProps>, query: string, headers: Record<string, string> = {}) =>
  graphqlHTTPFactory({ schema, ...props })(jsonRequest({ query }, headers), fakeResponse());

describe('maskErrors', () => {
  test('without maskErrors resolver messages are sent as is (backward compatible)', async () => {
    const res = await run({}, '{ dbError }');
    expect(res.errors?.[0]?.message).toMatch(/pg:\/\/admin:secret/);
  });

  test('internal errors are masked, GraphQLError and validation errors are not', async () => {
    const logged: Error[] = [];
    const props = { maskErrors: true, onError: (e: Error) => logged.push(e) };

    const internal = await run(props, '{ dbError }');
    expect(internal.errors?.[0]).toMatchObject({
      message: 'Internal server error',
      path: ['dbError'],
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(JSON.stringify(internal)).not.toMatch(/secret/);
    expect(logged[0].message).toMatch(/pg:\/\/admin:secret/);

    const forbidden = await run(props, '{ forbidden }');
    expect(forbidden.errors?.[0]).toMatchObject({ message: 'Access denied', extensions: { code: 'FORBIDDEN' } });

    const invalid = await run(props, '{ unknownField }');
    expect(invalid.errors?.[0]?.message).toMatch(/Cannot query field "unknownField"/);
  });

  test('invalid variable values are request errors and are not masked', async () => {
    const withDate = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          echo: { type: GraphQLString, args: { d: { type: DateTimeScalarType } }, resolve: () => 'ok' },
        },
      }),
    });
    const res = await graphqlHTTPFactory({ schema: withDate, maskErrors: true })(
      jsonRequest({ query: 'query($d: DateTime) { echo(d: $d) }', variables: { d: '05.03.2026' } }),
      fakeResponse(),
    );

    expect(res.data).toBeUndefined();
    expect(res.errors?.[0]?.message).toMatch(/ISO 8601/);
    expect(res.errors?.[0]?.extensions?.errorType).toBe('graphql-error-validate-request');
  });

  test('errors thrown by a middleware are masked too', async () => {
    const res = await run(
      {
        maskErrors: true,
        middleware: () => {
          throw new Error('redis connection refused 10.0.0.7:6379');
        },
      },
      '{ ok }',
    );
    expect(res.errors?.[0]?.message).toBe('Internal server error');
  });
});

describe('extensions', () => {
  test('server statistics are returned only in debug mode', async () => {
    expect((await run({}, '{ ok }')).extensions).toBeUndefined();
    expect((await run({ debug: true }, '{ ok }')).extensions).toMatchObject({ requestCounter: 1 });
  });
});

describe('csrfPrevention', () => {
  const listener = graphqlHTTPFactory({ schema, csrfPrevention: true });
  const multipart = (headers: Record<string, string> = {}) =>
    listener(
      fakeRequest({
        headers: { 'content-type': 'multipart/form-data; boundary=x', ...headers },
        chunks: ['--x\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{"query":"{ ok }"}\r\n--x--\r\n'],
      }),
      fakeResponse(),
    );

  test('multipart and GET requests without a preflight header are rejected', async () => {
    expect((await multipart()).errors?.[0]?.message).toMatch(/CSRF prevention/);

    const get = await listener(fakeRequest({ method: 'GET', url: '/?query={ok}' }), fakeResponse());
    expect(get.errors?.[0]?.message).toMatch(/CSRF prevention/);
  });

  test('requests with a preflight header or JSON body pass', async () => {
    expect((await multipart({ 'apollo-require-preflight': 'true' })).data).toEqual({ ok: 'ok' });
    expect((await listener(jsonRequest({ query: '{ ok }' }), fakeResponse())).data).toEqual({ ok: 'ok' });
  });
});

describe('persistedQueriesOnly', () => {
  const props = { persistedQueriesOnly: true, persistedQueriesMap: { q1: '{ ok }' } };

  test('arbitrary queries are rejected', async () => {
    const res = await run(props, '{ ok }');
    expect(res.errors?.[0]?.message).toBe('Only persisted queries are allowed');
  });

  test('persisted queries are executed', async () => {
    const res = await graphqlHTTPFactory({ schema, ...props })(jsonRequest({ documentId: 'q1' }), fakeResponse());
    expect(res.data).toEqual({ ok: 'ok' });
  });

  test('unknown or prototype keys are not treated as persisted', async () => {
    for (const documentId of ['unknown', 'constructor', '__proto__', 'toString']) {
      const res = await graphqlHTTPFactory({ schema, ...props })(jsonRequest({ documentId }), fakeResponse());
      expect(res.errors?.[0]?.message).toBe('Only persisted queries are allowed');
    }
  });
});

describe('introspection', () => {
  test('can be disabled, __typename still works', async () => {
    const res = await run({ introspection: false }, '{ __schema { types { name } } }');
    expect(res.errors?.[0]?.message).toMatch(/introspection/i);

    const typename = await run({ introspection: false }, '{ __typename }');
    expect(typename.data).toEqual({ __typename: 'Query' });
  });
});

describe('maxGraphQLTokens', () => {
  test('the parser stops on documents with too many tokens', async () => {
    const query = `{ ${Array(200).fill('ok').join(' ')} }`;
    const res = await run({ limits: { maxGraphQLTokens: 100 } }, query);
    expect(res.errors?.[0]?.message).toMatch(/contains more \w+ 100 tokens/) // graphql-js message: "more that";
  });
});
