import type { BuildConnectionOptions, CursorConnection } from './types';

/**
 * Builds the connection from the records of one page.
 *
 * The cursor of every edge is the cursor of the page with the position of
 * the record: `{ ...cursor, offset: cursor.offset + index }`.
 *
 * `hasPreviousPage` / `hasNextPage` come from the query: the core does not
 * know the database. A common way is `lag(id) over (...) as prev` and
 * `lead(id) over (...) as next`: window functions see the whole filtered
 * list before limit/offset, so the first record of the page has `prev`
 * if there is something before the page.
 */
const buildConnection = <Node>(
  nodes: readonly Node[],
  options: BuildConnectionOptions,
): CursorConnection<Node> => {
  const { cursor, codec, hasPreviousPage, hasNextPage } = options;
  const edges = nodes.map((node, index) => ({
    node,
    cursor: codec.encode({ ...cursor, offset: cursor.offset + index }),
  }));

  return {
    edges,
    pageInfo: {
      hasPreviousPage: edges.length > 0 && hasPreviousPage,
      hasNextPage: edges.length > 0 && hasNextPage,
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
    },
  } as CursorConnection<Node>;
};

export default buildConnection;
