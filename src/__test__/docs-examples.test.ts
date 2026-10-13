import crypto from 'node:crypto';
/**
 * Code examples from docs/ executed against the real core.
 * If a test fails, update the documentation together with the code.
 */
import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import type { Middleware } from '@via-profit-services/core';

import { graphqlHTTPFactory, fieldsWrapper, createCursorCodec, parseConnectionArgs } from '../index';
import { fakeRequest, jsonRequest, fakeResponse } from './helpers';

const Post = new GraphQLObjectType({ name: 'Post', fields: { title: { type: GraphQLString } } });
const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    name: { type: GraphQLString },
    posts: {
      type: new GraphQLList(Post),
      args: { first: { type: GraphQLInt } },
      resolve: () => [],
    },
  },
});
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(User),
        args: { first: { type: GraphQLInt } },
        resolve: () => [],
      },
      fails: {
        type: GraphQLString,
        resolve: () => {
          throw new Error('boom');
        },
      },
      secret: {
        type: GraphQLString,
        extensions: { requiredRole: 'admin' },
        resolve: () => 'secret',
      },
    },
  }),
  mutation: new GraphQLObjectType({ name: 'Mutation', fields: { m: { type: GraphQLString } } }),
});

describe('docs/guides/configuration.md', () => {
  test('complexity example equals 2200', async () => {
    let complexity = 0;
    await graphqlHTTPFactory({
      schema,
      limits: { complexityLimit: { maxComplexity: 1e9, onComplete: c => (complexity = c) } },
    })(
      jsonRequest({ query: '{ users(first: 100) { name posts(first: 10) { title } } }' }),
      fakeResponse(),
    );

    expect(complexity).toBe(2200);
  });
});

describe('docs/guides/errors.md: HTTP-статусы', () => {
  test('rate limit middleware sets 429 via extensions.http.status', async () => {
    const rateLimitMiddleware: Middleware = async () => {
      throw new GraphQLError('Too many requests', {
        extensions: { code: 'RATE_LIMITED', http: { status: 429 } },
      });
    };
    const response = await graphqlHTTPFactory({ schema, middleware: [rateLimitMiddleware] })(
      jsonRequest({ query: '{ users { name } }' }),
      fakeResponse(),
    );

    expect(response.status).toBe(429);
    expect(response.errors?.[0]?.extensions).toEqual({ code: 'RATE_LIMITED' });
  });

  test('README: status is sent separately from the body', async () => {
    const response = await graphqlHTTPFactory({ schema })(
      jsonRequest({ query: '{ fails }' }),
      fakeResponse(),
    );

    expect(response.status ?? 200).toBe(200); // partial success
    expect(Object.keys(JSON.parse(JSON.stringify(response)))).toEqual(['data', 'errors', 'extensions']);
  });
});

describe('docs/guides/middlewares.md', () => {
  test('read-only middleware rule affects only its request', async () => {
    const readOnlyMiddleware: Middleware = ({ request, validationRule }) => {
      if (request.headers['x-client'] !== 'read-only') {
        return;
      }

      validationRule.push(validationContext => ({
        OperationDefinition(node) {
          if (node.operation === 'mutation') {
            validationContext.reportError(
              new GraphQLError('Mutations are not allowed', { nodes: [node] }),
            );
          }
        },
      }));
    };
    const listener = graphqlHTTPFactory({ schema, middleware: [readOnlyMiddleware] });

    const blocked = await listener(
      jsonRequest({ query: 'mutation { m }' }, { 'x-client': 'read-only' }),
      fakeResponse(),
    );
    const allowed = await listener(jsonRequest({ query: 'mutation { m }' }), fakeResponse());

    expect(blocked.errors?.[0]?.message).toBe('Mutations are not allowed');
    expect(allowed.errors).toBeUndefined();
  });
});

describe('docs/api/api.md: fieldsWrapper example', () => {
  test('role check via field extensions', async () => {
    const wrapped = fieldsWrapper(
      new GraphQLSchema({ query: schema.getQueryType() }),
      ({ context, info }) => {
        const required = info.parentType.getFields()[info.fieldName].extensions?.requiredRole;
        const user = (context as { user?: { roles: string[] } }).user;

        if (required && !user?.roles.includes(required as string)) {
          return {
            resolve: () => {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
            },
          };
        }

        return {};
      },
    );
    const listener = graphqlHTTPFactory({
      schema: wrapped,
      middleware: ({ context, request }) => {
        Object.assign(context, {
          user: { roles: request.headers['x-role'] ? [request.headers['x-role']] : [] },
        });
      },
    });

    const denied = await listener(jsonRequest({ query: '{ secret }' }), fakeResponse());
    const granted = await listener(
      jsonRequest({ query: '{ secret }' }, { 'x-role': 'admin' }),
      fakeResponse(),
    );

    expect(denied.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(granted.data).toEqual({ secret: 'secret' });
  });
});

describe('docs/guides/connections.md', () => {
  // the key from the guide: HKDF of an existing secret, 32 bytes
  const cursorKey = Buffer.from(
    crypto.hkdfSync('sha256', 'jwt-private-key', '', 'my-project-connection-cursor', 32),
  );
  const cursorCodec = createCursorCodec({ secret: cursorKey });

  test('the server restriction wins over the cursor, other filters come from it', () => {
    const own = parseConnectionArgs(
      { first: 2 },
      { status: ['allowed'], client: ['own'] },
      { codec: cursorCodec, maxPageSize: 100 },
    );
    // a cursor issued to another user
    const foreign = cursorCodec.encode({ ...own.cursor, client: ['foreign'], offset: 1 });
    const next = parseConnectionArgs(
      { first: 2, after: foreign },
      { status: undefined, client: ['own'] },
      { codec: cursorCodec, maxPageSize: 100 },
    );

    expect(next).toEqual({
      limit: 2,
      offset: 2,
      cursor: { status: ['allowed'], client: ['own'], offset: 2 },
    });
  });
});

describe('docs/guides/persisted-queries.md', () => {
  test('GET with documentId', async () => {
    const listener = graphqlHTTPFactory({
      schema,
      persistedQueriesMap: { 'users-v1': 'query Users($n: Int) { users(first: $n) { name } }' },
      persistedQueriesOnly: true,
    });
    const url = `/graphql?documentId=users-v1&variables=${encodeURIComponent('{"n":5}')}`;
    const res = await listener(fakeRequest({ method: 'GET', url }), fakeResponse());

    expect(res.data).toEqual({ users: [] });
  });
});
