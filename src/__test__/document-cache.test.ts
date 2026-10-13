import * as graphql from 'graphql';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { graphqlHTTPFactory } from '../index';
import { LRUCache } from '../utils/lru-cache';
import { jsonRequest, fakeResponse } from './helpers';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: { ok: { type: GraphQLString, args: { s: { type: GraphQLString } }, resolve: (_p, a) => a.s ?? 'ok' } },
  }),
});

describe('LRUCache', () => {
  test('evicts the least recently used entries by count and by size', () => {
    const cache = new LRUCache<string, number>(2, 100);
    cache.set('a', 1, 10);
    cache.set('b', 2, 10);
    cache.get('a'); // a becomes the most recent
    cache.set('c', 3, 10);
    expect([cache.get('a'), cache.get('b'), cache.get('c')]).toEqual([1, undefined, 3]);

    cache.set('big', 4, 95); // exceeds the size budget together with others
    expect([cache.get('a'), cache.get('c'), cache.get('big')]).toEqual([undefined, undefined, 4]);

    cache.set('huge', 5, 101); // larger than the whole cache: not stored
    expect(cache.get('huge')).toBeUndefined();
  });
});

describe('Document cache', () => {
  test('a repeated query is parsed once, variables still apply', async () => {
    const operations: unknown[] = [];
    const listener = graphqlHTTPFactory({
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            ok: {
              type: GraphQLString,
              args: { s: { type: GraphQLString } },
              resolve: (_parent, args, _context, info) => {
                operations.push(info.operation); // a node of the parsed document
                return args.s;
              },
            },
          },
        }),
      }),
    });
    const query = 'query($s: String) { ok(s: $s) }';

    const first = await listener(jsonRequest({ query, variables: { s: 'one' } }), fakeResponse());
    const second = await listener(jsonRequest({ query, variables: { s: 'two' } }), fakeResponse());

    expect(first.data).toEqual({ ok: 'one' });
    expect(second.data).toEqual({ ok: 'two' });
    // the same AST object: the document was taken from the cache
    expect(operations[0]).toBe(operations[1]);
  });

  test('validation errors are returned for cached invalid documents too', async () => {
    const listener = graphqlHTTPFactory({ schema });
    for (let i = 0; i < 2; i++) {
      const res = await listener(jsonRequest({ query: '{ unknown }' }), fakeResponse());
      expect(res.errors?.[0]?.message).toMatch(/Cannot query field "unknown"/);
    }
  });

  test('complexity still uses the variables of every request', async () => {
    const listener = graphqlHTTPFactory({
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            list: {
              type: new graphql.GraphQLList(GraphQLString),
              args: { first: { type: graphql.GraphQLInt } },
              resolve: () => [],
            },
          },
        }),
      }),
      limits: { complexityLimit: { maxComplexity: 100 } },
    });
    const query = 'query($n: Int) { list(first: $n) }';

    const small = await listener(jsonRequest({ query, variables: { n: 10 } }), fakeResponse());
    const large = await listener(jsonRequest({ query, variables: { n: 1000 } }), fakeResponse());

    expect(small.errors).toBeUndefined();
    expect(large.errors?.[0]?.message).toMatch(/complexity 1000 exceeds/);
  });
});
