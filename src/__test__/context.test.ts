import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import type { Middleware } from '@via-profit-services/core';

import { graphqlHTTPFactory } from '../index';
import { jsonRequest, fakeResponse, sleep } from './helpers';

declare module '@via-profit-services/core' {
  interface Context {
    user?: string;
  }
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      whoami: {
        type: GraphQLString,
        resolve: async (_parent, _args, context) => {
          // give the concurrent request a chance to run its middleware
          await sleep(30);

          return context.user;
        },
      },
    },
  }),
});

// Writes the user from the header. The delay makes requests interleave.
const authMiddleware: Middleware = async ({ context, request }) => {
  await sleep(Number(request.headers['x-delay'] || 0));
  context.user = String(request.headers['x-user']);
};

const ask = (listener: ReturnType<typeof graphqlHTTPFactory>, user: string, delay: number) =>
  listener(
    jsonRequest({ query: '{ whoami }' }, { 'x-user': user, 'x-delay': String(delay) }),
    fakeResponse(),
  );

describe('Request isolation', () => {
  test('concurrent requests do not see the context of each other', async () => {
    const listener = graphqlHTTPFactory({ schema, middleware: [authMiddleware] });
    const [alice, mallory] = await Promise.all([ask(listener, 'alice', 0), ask(listener, 'mallory', 10)]);

    expect(alice.data).toEqual({ whoami: 'alice' });
    expect(mallory.data).toEqual({ whoami: 'mallory' });
  });

  test('legacy sharedContext mode keeps one context object for all requests', async () => {
    const contexts = new Set<object>();
    const listener = graphqlHTTPFactory({
      schema,
      sharedContext: true,
      middleware: ({ context }) => {
        contexts.add(context);
      },
    });

    await listener(jsonRequest({ query: '{ whoami }' }), fakeResponse());
    await listener(jsonRequest({ query: '{ whoami }' }), fakeResponse());

    expect(contexts.size).toBe(1);
  });

  test('validation rules pushed by a middleware do not accumulate', async () => {
    let calls = 0;
    const listener = graphqlHTTPFactory({
      schema,
      middleware: ({ validationRule }) => {
        validationRule.push(() => {
          calls += 1;

          return {};
        });
      },
    });

    for (let i = 0; i < 10; i++) {
      await listener(jsonRequest({ query: '{ whoami }' }), fakeResponse());
    }

    // one rule per request, not 1 + 2 + ... + 10
    expect(calls).toBe(10);
  });

  test('extensions written by a middleware stay inside its request', async () => {
    const listener = graphqlHTTPFactory({
      schema,
      debug: true,
      middleware: ({ extensions, request }) => {
        if (request.headers['x-secret']) {
          extensions.secret = request.headers['x-secret'];
        }
      },
    });

    const first = await listener(
      jsonRequest({ query: '{ whoami }' }, { 'x-secret': 'alice-session' }),
      fakeResponse(),
    );
    const second = await listener(jsonRequest({ query: '{ whoami }' }), fakeResponse());

    expect(first.extensions).toHaveProperty('secret', 'alice-session');
    expect(second.extensions).not.toHaveProperty('secret');
  });
});
