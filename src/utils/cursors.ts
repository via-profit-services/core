import type {
  StringToCursor,
  CursorToString,
  MakeNodeCursor,
  GetCursorPayload,
  BuildCursorConnection,
  PageInfo,
} from '@via-profit-services/core';

import { nodeToEdge } from './nodes';

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 * ```ts
 * // Deprecated. Use code below instead
 * Buffer.from('<Data for cursor>', 'utf8').toString('base64');
 * ```
 */
export const stringToCursor: StringToCursor = str =>
  Buffer.from(String(str), 'utf8').toString('base64');

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 * ```ts
 * // Deprecated. Use code below instead
 * Buffer.from('<Cursor value>', 'base64').toString('utf8');
 * ```
 */
export const cursorToString: CursorToString = cursor =>
  Buffer.from(cursor, 'base64').toString('utf8');

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const makeNodeCursor: MakeNodeCursor = (cursorName, cursorPayload) =>
  stringToCursor([JSON.stringify(cursorPayload), cursorName].join('---'));

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const getCursorPayload: GetCursorPayload = cursor => {
  try {
    const cursorPayload = cursorToString(cursor).split('---')[0] || '';

    return JSON.parse(cursorPayload);
  } catch (err) {
    throw new Error('Failed to decode cursor payload');
  }
};

export const buildCursorConnection: BuildCursorConnection = (props, cursorName) => {
  const { nodes, totalCount, offset, limit, where, revert, orderBy, between, search } = props;

  const edges = nodes.map((node, index) =>
    nodeToEdge(node, cursorName, {
      offset: offset + index + 1,
      where: where || [],
      orderBy: orderBy || [],
      search,
      between,
    }),
  );

  const pageInfo: PageInfo = {
    startCursor: edges.length ? edges[0].cursor : undefined,
    endCursor: edges.length ? edges[edges.length - 1].cursor : undefined,
    hasPreviousPage: offset > 0,
    hasNextPage: offset + limit < totalCount,
  };

  if (revert) {
    pageInfo.startCursor = edges.length ? edges[edges.length - 1].cursor : undefined;
    pageInfo.endCursor = edges.length ? edges[0].cursor : undefined;
    pageInfo.hasNextPage = offset > 0;
    pageInfo.hasPreviousPage = offset + limit < totalCount;
  }

  return {
    edges,
    pageInfo,
  };
};
