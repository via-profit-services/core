import { makeNodeCursor, getCursorPayload, buildCursorConnection } from '../utils/cursors';
import { CursorPayload } from '@via-profit-services/core';

import books from './books';

describe('Cursors', () => {
  test('makeNodeCursor -> getCursorPayload', () => {
    const cursorPayload: CursorPayload = {
      offset: 10,
      between: {},
      search: null,
      where: [['category', '=', 'Test']],
      orderBy: [
        {
          field: 'name',
          direction: 'desc',
        },
      ],
    };
    const cursor = makeNodeCursor('test-cursor', cursorPayload);
    const payload = getCursorPayload(cursor);

    expect(JSON.stringify(payload)).toEqual(JSON.stringify(cursorPayload));
  });

  test('Pagination hasPreviousPage hasNextPage test 1', () => {
    const offset = 3;
    const limit = 4;

    const connection = buildCursorConnection(
      {
        offset,
        limit,
        totalCount: books.length,
        nodes: [...books].splice(offset, limit),
      },
      'books',
    );

    expect(connection.pageInfo.hasPreviousPage).toBe(true);
    expect(connection.pageInfo.hasNextPage).toBe(true);
  });

  test('Pagination hasPreviousPage hasNextPage test 2', () => {
    const offset = 0;
    const limit = 6;

    const connection = buildCursorConnection(
      {
        offset,
        limit,
        totalCount: books.length,
        nodes: [...books].splice(offset, limit),
      },
      'books',
    );

    expect(connection.pageInfo.hasPreviousPage).toBe(false);
    expect(connection.pageInfo.hasNextPage).toBe(true);
  });

  test('Pagination hasPreviousPage hasNextPage test 3', () => {
    const offset = 10;
    const limit = 3;

    const connection = buildCursorConnection(
      {
        offset,
        limit,
        totalCount: books.length,
        nodes: [...books].splice(offset, limit),
      },
      'books',
    );

    expect(connection.pageInfo.hasPreviousPage).toBe(true);
    expect(connection.pageInfo.hasNextPage).toBe(false);
  });

  // test('Pagination test-3', () => {
  //   const cursor = makeNodeCursor('test-3', {
  //     offset: 4,
  //     where: [],
  //     between: {},
  //     orderBy: [],
  //   });

  //   const filter = buildQueryFilter({
  //     first: 10,
  //     after: cursor,
  //   });

  //   expect(filter).toBe({
  //     limit: 10,
  //     offset: 4,
  //     orderBy: [],
  //     where: [],
  //     search: false,
  //     between: {},
  //     revert: false,
  //   });
  // });

  // test('Pagination test-4', () => {
  //   const cursor = makeNodeCursor('test-4', {
  //     offset: 30,
  //     where: [],
  //     between: {},
  //     orderBy: [],
  //   });

  //   const filter = buildQueryFilter({
  //     last: 10,
  //     before: cursor,
  //   });

  //   expect(filter).toBe({
  //     limit: 10,
  //     offset: 20,
  //     orderBy: [],
  //     where: [],
  //     search: false,
  //     between: {},
  //     revert: false,
  //   });
  // });

  // test('Pagination test-5', () => {
  //   const offset = 4;
  //   const limit = 3;

  //   const connection = buildCursorConnection(
  //     {
  //       offset,
  //       limit,
  //       totalCount: books.length,
  //       nodes: [...books].splice(offset, limit),
  //     },
  //     'books',
  //   );
  //   expect(connection.edges[0].cursor).toBe(connection.pageInfo.startCursor);
  //   expect(connection.edges[connection.edges.length - 1].cursor).toBe(
  //     connection.pageInfo.endCursor,
  //   );
  // });
});
