import {
  getIntrospectionQuery,
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import type { InitProps } from '@via-profit-services/core';

import { graphqlHTTPFactory } from '../index';
import { jsonRequest, fakeResponse } from './helpers';

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
      plain: { type: GraphQLString, resolve: () => 'plain' },
      items: itemsField(),
    },
  }),
});

const run = async (query: string, props: Partial<InitProps> = {}, variables?: Record<string, unknown>) => {
  const listener = graphqlHTTPFactory({ schema, ...props });

  return listener(jsonRequest({ query, variables }), fakeResponse());
};

const messages = (res: { errors?: readonly { message: string }[] | null }) =>
  (res.errors ?? []).map(e => e.message).join('\n');

describe('Depth limit', () => {
  const limits = { maxGraphQLDepthLimit: 3 };

  test('fragments and inline fragments do not add a level', async () => {
    const plain = await run('{ items { items { items { id } } } }', { limits });
    const inline = await run('{ items { ... on Item { items { items { id } } } } }', { limits });
    const spread = await run('{ items { ...F } } fragment F on Item { items { items { id } } }', { limits });

    expect([plain.errors, inline.errors, spread.errors]).toEqual([undefined, undefined, undefined]);
  });

  test('a query deeper than the limit is rejected, also through fragments', async () => {
    const res = await run(
      '{ items { ...F } } fragment F on Item { items { ...G } } fragment G on Item { items { items { id } } }',
      { limits },
    );

    expect(messages(res)).toMatch(/too deeply nested. Maximum allowed depth is 3/);
  });

  test('the standard introspection query passes with default limits', async () => {
    const res = await run(getIntrospectionQuery());

    expect(res.errors).toBeUndefined();
    expect(res.data?.__schema).toBeDefined();
  });

  test('introspection has its own limit', async () => {
    const res = await run(getIntrospectionQuery(), {
      limits: { maxGraphQLDepthLimit: 30, maxGraphQLIntrospectionDepthLimit: 5 },
    });

    expect(messages(res)).toMatch(/introspection query is too deeply nested. Maximum allowed depth is 5/);
  });

  test('recursive introspection abuse is rejected', async () => {
    const nested = 'fields { type { '.repeat(12) + 'name' + ' } }'.repeat(12);
    const res = await run(`{ __type(name: "Item") { ${nested} } }`);

    expect(messages(res)).toMatch(/introspection query is too deeply nested/);
  });
});

describe('Validation performance', () => {
  // F0 spreads F1 30 times, F1 spreads F2 30 times...: 30^levels paths
  const fanOut = (levels: number, fan: number) => {
    const fragments = [];
    for (let level = 0; level < levels; level++) {
      const spreads = level + 1 < levels ? Array(fan).fill(`...F${level + 1}`).join(' ') : '';
      fragments.push(`fragment F${level} on Query { plain ${spreads} }`);
    }

    return `{ ${Array(fan).fill('...F0').join(' ')} } ${fragments.join(' ')}`;
  };

  test('fragment fan-out is validated in linear time and rejected by complexity', async () => {
    const query = fanOut(8, 30); // ~2 KB, 30^8 = 6.5e11 paths
    const start = performance.now();
    const res = await run(query);
    const duration = performance.now() - start;

    // the old rules needed minutes for this query
    expect(duration).toBeLessThan(500);
    expect(messages(res)).toMatch(/Query complexity .* exceeds/);
  });
});

describe('Complexity limit', () => {
  const limits = { complexityLimit: { maxComplexity: 100 } };

  test('list size passed via a variable is taken into account', async () => {
    const literal = await run('{ items(first: 1000) { id } }', { limits });
    const variable = await run('query($n: Int) { items(first: $n) { id } }', { limits }, { n: 1000 });
    const defaultValue = await run('query($n: Int = 1000) { items(first: $n) { id } }', { limits });

    expect(messages(literal)).toMatch(/complexity 2000 exceeds/);
    expect(messages(variable)).toMatch(/complexity 2000 exceeds/);
    expect(messages(defaultValue)).toMatch(/complexity 2000 exceeds/);
  });

  test('a fragment is counted every time it is spread', async () => {
    const aliases = Array.from({ length: 50 }, (_, i) => `a${i}: items(first: 50) { ...F }`).join(' ');
    let complexity = 0;
    await run(`{ ${aliases} } fragment F on Item { id }`, {
      limits: { complexityLimit: { maxComplexity: 1e9, onComplete: c => (complexity = c) } },
    });

    // 50 aliases * (1 + 1) * 50; the old rule counted the fragment once: 2550
    expect(complexity).toBe(5000);
  });

  test('defaultListMultiplier is applied to list fields without a size argument', async () => {
    let complexity = 0;
    await run('{ items { id } plain }', {
      limits: { complexityLimit: { maxComplexity: 1e9, defaultListMultiplier: 10, onComplete: c => (complexity = c) } },
    });

    // items: (1 + 1) * 10 = 20, plain: 1
    expect(complexity).toBe(21);
  });

  test('createError and maxFieldsPerSelection', async () => {
    const res = await run('{ items(first: 1000) { id } }', {
      limits: {
        complexityLimit: {
          maxComplexity: 10,
          createError: (max, actual) => new GraphQLError(`Too expensive: ${actual} > ${max}`),
        },
      },
    });
    expect(messages(res)).toBe('Too expensive: 2000 > 10');

    const wide = await run(`{ ${Array.from({ length: 5 }, (_, i) => `p${i}: plain`).join(' ')} }`, {
      limits: { complexityLimit: { maxComplexity: 1000, maxFieldsPerSelection: 4 } },
    });
    expect(messages(wide)).toMatch(/contains 5 fields. Maximum allowed is 4/);
  });
});

describe('Validation rules do not keep state between requests', () => {
  test('fragments of previous requests are not retained', async () => {
    const listener = graphqlHTTPFactory({ schema });
    const sizes: number[] = [];
    const originalSet = Map.prototype.set;

    // count Map entries holding fragment definitions
    const holders = new Map<object, number>();
    Map.prototype.set = function (key, value) {
      if (value && value.kind === 'FragmentDefinition') {
        holders.set(this, (holders.get(this) ?? 0) + 1);
      }

      return originalSet.call(this, key, value);
    };

    try {
      for (let i = 0; i < 50; i++) {
        await listener(
          jsonRequest({ query: `{ ...F${i} } fragment F${i} on Query { plain }` }),
          fakeResponse(),
        );
      }
    } finally {
      Map.prototype.set = originalSet;
    }

    holders.forEach(count => sizes.push(count));
    // every Map lives for one validation only: one fragment each
    expect(Math.max(...sizes)).toBe(1);
  });
});
