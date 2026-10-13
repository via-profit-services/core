import crypto from 'node:crypto';
import {
  GraphQLError,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import type { ConnectionArgs, CursorConnection } from '@via-profit-services/core';

import {
  buildConnection,
  createCursorCodec,
  graphqlHTTPFactory,
  parseConnectionArgs,
  ConnectionInterfaceType,
  EdgeInterfaceType,
  NodeInterfaceType,
  PageInfoType,
} from '../index';
import { fakeResponse, jsonRequest } from './helpers';

const secret = crypto.randomBytes(32);
const codec = createCursorCodec({ secret });

const thrown = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    return err as GraphQLError;
  }

  throw new Error('Expected an error');
};

const parse = (args: ConnectionArgs, filters: object = {}, maxPageSize?: number) =>
  parseConnectionArgs(args, filters, { codec, maxPageSize });

describe('createCursorCodec', () => {
  test('encode / decode round trip, the payload is readable', () => {
    const cursor = codec.encode({ offset: 5, status: ['allowed'] });

    expect(codec.decode(cursor)).toEqual({ offset: 5, status: ['allowed'] });
    expect(JSON.parse(Buffer.from(cursor.split('.')[0], 'base64url').toString())).toEqual({
      offset: 5,
      status: ['allowed'],
    });
  });

  test('a changed, unsigned or foreign cursor is rejected', () => {
    const cursor = codec.encode({ offset: 5, client: ['own'] });
    const [, signature] = cursor.split('.');
    const changed = `${Buffer.from(JSON.stringify({ offset: 5, client: ['foreign'] })).toString('base64url')}.${signature}`;
    const unsigned = Buffer.from(JSON.stringify({ offset: 5 })).toString('base64');
    const foreign = createCursorCodec({ secret: crypto.randomBytes(32) }).encode({ offset: 5 });

    for (const value of [changed, unsigned, foreign, `${cursor}.x`, '', '.', `${cursor.slice(0, -1)}A`]) {
      const error = thrown(() => codec.decode(value));
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Invalid cursor');
      expect(error.extensions.code).toBe('BAD_USER_INPUT');
    }
  });

  test('a short secret is refused, a string secret works', () => {
    expect(() => createCursorCodec({ secret: 'password' })).toThrow(/at least 32 bytes/);

    const stringCodec = createCursorCodec({ secret: 'x'.repeat(32) });
    expect(stringCodec.decode(stringCodec.encode({ offset: 1 }))).toEqual({ offset: 1 });
  });
});

describe('parseConnectionArgs', () => {
  test('first page, page after the cursor, page before the cursor', () => {
    expect(parse({ first: 10 }, { status: 'a' })).toEqual({
      limit: 10,
      offset: 0,
      cursor: { status: 'a', offset: 0 },
    });

    const after = codec.encode({ status: 'a', offset: 9 });
    expect(parse({ first: 10, after })).toEqual({
      limit: 10,
      offset: 10,
      cursor: { status: 'a', offset: 10 },
    });

    const before = codec.encode({ status: 'a', offset: 25 });
    expect(parse({ last: 10, before })).toEqual({
      limit: 10,
      offset: 15,
      cursor: { status: 'a', offset: 15 },
    });
  });

  test('`before` near the start: only the records before the cursor', () => {
    // the cursor record (position 3) and the records after it are not included
    expect(parse({ last: 10, before: codec.encode({ offset: 3 }) })).toMatchObject({ limit: 3, offset: 0 });
    expect(parse({ last: 10, before: codec.encode({ offset: 0 }) })).toMatchObject({ limit: 0, offset: 0 });
  });

  test('page navigation by offset', () => {
    expect(parse({ first: 20, offset: 40 }, { id: ['1'] })).toEqual({
      limit: 20,
      offset: 40,
      cursor: { id: ['1'], offset: 40 },
    });
  });

  test('`first: 0` is a valid empty page, `null` means «not passed»', () => {
    expect(parse({ first: 0 })).toMatchObject({ limit: 0, offset: 0 });
    expect(parse({ first: 5, last: null, after: null, before: null, offset: null })).toMatchObject({
      limit: 5,
      offset: 0,
    });
  });

  test.each<[string, ConnectionArgs, RegExp]>([
    ['nothing', {}, /Missing «first» or «last»/],
    ['first and last', { first: 1, last: 1 }, /Got «first» and «last»/],
    ['after and before', { first: 1, after: 'a', before: 'b' }, /Got «after» and «before»/],
    ['first with before', { first: 1, before: 'b' }, /«before» is used with «last»/],
    ['last with after', { last: 1, after: 'a' }, /«after» is used with «first»/],
    ['last without before', { last: 1 }, /Missing «before»/],
    ['negative first', { first: -1 }, /«first» must be a non-negative integer/],
    ['fractional last', { last: 1.5, before: 'b' }, /«last» must be a non-negative integer/],
    ['offset with last', { last: 1, before: 'b', offset: 1 }, /«offset» can be used with the «first»/],
    ['offset with after', { first: 1, after: 'a', offset: 1 }, /«offset» can be used with the «first»/],
    ['negative offset', { first: 1, offset: -1 }, /«offset» must be a non-negative integer/],
  ])('%s is rejected', (_name, args, message) => {
    const error = thrown(() => parse(args));

    expect(error).toBeInstanceOf(GraphQLError);
    expect(error.message).toMatch(message);
    expect(error.extensions.code).toBe('BAD_USER_INPUT');
  });

  test('maxPageSize', () => {
    expect(parse({ first: 100 }, {}, 100)).toMatchObject({ limit: 100 });
    expect(thrown(() => parse({ first: 101 }, {}, 100)).message).toBe('Argument «first» must not exceed 100');
    expect(thrown(() => parse({ last: 9999, before: 'b' }, {}, 100)).message).toBe(
      'Argument «last» must not exceed 100',
    );
  });

  test('a signed payload without a valid offset is an invalid cursor', () => {
    for (const payload of [[], 'x', null, {}, { offset: -1 }, { offset: '5' }, { offset: 1.5 }]) {
      expect(thrown(() => parse({ first: 1, after: codec.encode(payload) })).message).toBe('Invalid cursor');
    }
  });

  test('explicit filters win over the cursor, undefined ones do not', () => {
    const after = codec.encode({ client: ['foreign'], status: ['allowed'], search: 'x', offset: 4 });
    const { cursor } = parse(
      { first: 10, after },
      { client: ['own'], status: undefined, search: null, offset: 100 },
    );

    // client: restriction of the server; status: taken from the cursor;
    // search: explicitly reset; offset: always from the cursor
    expect(cursor).toEqual({ client: ['own'], status: ['allowed'], search: null, offset: 5 });
  });

  test('filters of the first page look as they will come back from a cursor', () => {
    const { cursor } = parse({ first: 1 }, { from: new Date('2026-01-02T03:04:05Z'), skip: undefined });

    expect(cursor).toEqual({ from: '2026-01-02T03:04:05.000Z', offset: 0 });
  });
});

describe('buildConnection', () => {
  test('edges get the cursor of the page with their position', () => {
    const connection = buildConnection([{ id: 'a' }, { id: 'b' }], {
      cursor: { status: 'x', offset: 10 } as { offset: number },
      codec,
      hasPreviousPage: true,
      hasNextPage: false,
    });

    expect(connection.edges.map(({ node, cursor }) => [node.id, codec.decode(cursor)])).toEqual([
      ['a', { status: 'x', offset: 10 }],
      ['b', { status: 'x', offset: 11 }],
    ]);
    expect(connection.pageInfo).toEqual({
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: connection.edges[0].cursor,
      endCursor: connection.edges[1].cursor,
    });
  });

  test('an empty page has no cursors and no neighbours', () => {
    expect(
      buildConnection([], { cursor: { offset: 0 }, codec, hasPreviousPage: true, hasNextPage: true }).pageInfo,
    ).toEqual({ hasPreviousPage: false, hasNextPage: false, startCursor: undefined, endCursor: undefined });
  });
});

describe('Paging through a list', () => {
  // The «database»: 23 records, the filter keeps the odd ones (11 records)
  const table = Array.from({ length: 23 }, (_, i) => ({ id: String(i), odd: i % 2 === 1 }));

  type Filters = { odd?: boolean | null };

  const query = (args: ConnectionArgs, filters: Filters) => {
    const { limit, offset, cursor } = parseConnectionArgs(args, filters, { codec, maxPageSize: 5 });
    const list = table.filter(row => cursor.odd === undefined || cursor.odd === null || row.odd === cursor.odd);
    const nodes = list.slice(offset, offset + limit);

    return buildConnection(nodes, {
      cursor,
      codec,
      hasPreviousPage: offset > 0,
      hasNextPage: offset + nodes.length < list.length,
    });
  };

  const ids = (page: CursorConnection<{ id: string }>) => page.edges.map(({ node }) => node.id);
  const expected = table.filter(row => row.odd).map(row => row.id);

  test('forward with `after` only, then back with `before`: no gaps, no repeats', () => {
    const forward: string[][] = [];
    let page = query({ first: 5 }, { odd: true });
    forward.push(ids(page));

    while (page.pageInfo.hasNextPage) {
      // the filter is not passed again: it comes from the cursor
      page = query({ first: 5, after: page.pageInfo.endCursor }, {});
      forward.push(ids(page));
    }

    expect(forward.flat()).toEqual(expected);
    expect(forward.map(p => p.length)).toEqual([5, 5, 1]);

    const backward: string[][] = [];
    while (page.pageInfo.hasPreviousPage) {
      page = query({ last: 5, before: page.pageInfo.startCursor }, {});
      backward.unshift(ids(page));
    }

    expect(backward.flat()).toEqual(expected.slice(0, 10));
  });
});

describe('Errors reach the client through maskErrors', () => {
  const Item = new GraphQLObjectType({
    name: 'Item',
    interfaces: [NodeInterfaceType],
    fields: { id: { type: new GraphQLNonNull(GraphQLID) } },
  });
  const ItemEdge = new GraphQLObjectType({
    name: 'ItemEdge',
    interfaces: [EdgeInterfaceType],
    fields: {
      cursor: { type: new GraphQLNonNull(GraphQLString) },
      node: { type: new GraphQLNonNull(Item) },
    },
  });
  const ItemsConnection = new GraphQLObjectType({
    name: 'ItemsConnection',
    interfaces: [ConnectionInterfaceType],
    fields: {
      pageInfo: { type: new GraphQLNonNull(PageInfoType) },
      edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ItemEdge))) },
    },
  });
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        items: {
          type: new GraphQLNonNull(ItemsConnection),
          args: {
            first: { type: GraphQLInt },
            last: { type: GraphQLInt },
            after: { type: GraphQLString },
            before: { type: GraphQLString },
          },
          resolve: (_parent, args: ConnectionArgs) => {
            const { limit, offset, cursor } = parseConnectionArgs(args, {}, { codec, maxPageSize: 50 });
            const nodes = Array.from({ length: limit }, (_, i) => ({ id: String(offset + i) }));

            return buildConnection(nodes, { cursor, codec, hasPreviousPage: offset > 0, hasNextPage: true });
          },
        },
      },
    }),
  });

  test('a valid request works, invalid arguments are public errors', async () => {
    const listener = graphqlHTTPFactory({ schema, maskErrors: true });
    const run = (query: string) => listener(jsonRequest({ query }), fakeResponse());

    const ok = await run('{ items(first: 2) { edges { node { id } } pageInfo { hasNextPage } } }');
    expect(ok.errors).toBeUndefined();
    expect(ok.data).toEqual({
      items: { edges: [{ node: { id: '0' } }, { node: { id: '1' } }], pageInfo: { hasNextPage: true } },
    });

    const badCursor = await run('{ items(first: 2, after: "abc") { edges { cursor } } }');
    expect(badCursor.errors?.[0]?.message).toBe('Invalid cursor');
    expect(badCursor.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');

    const tooLarge = await run('{ items(first: 9999) { edges { cursor } } }');
    expect(tooLarge.errors?.[0]?.message).toBe('Argument «first» must not exceed 50');
  });
});
