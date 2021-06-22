import type {
  StringToCursor,
  CursorToString,
  MakeNodeCursor,
  GetCursorPayload,
  BuildCursorConnection,
} from '@via-profit-services/core';

import ServerError from '../errorHandlers/ServerError';
import { nodeToEdge } from './nodes';

export const stringToCursor: StringToCursor = str =>
  Buffer.from(String(str), 'utf8').toString('base64');

export const cursorToString: CursorToString = cursor =>
  Buffer.from(cursor, 'base64').toString('utf8');

export const makeNodeCursor: MakeNodeCursor = (cursorName, cursorPayload) =>
  stringToCursor([JSON.stringify(cursorPayload), cursorName].join('---'));

export const getCursorPayload: GetCursorPayload = cursor => {
  try {
    const cursorPayload = cursorToString(cursor).split('---')[0] || '';

    return JSON.parse(cursorPayload);
  } catch (err) {
    throw new ServerError('Failed to decode cursor payload', { err });
  }
};

export const buildCursorConnection: BuildCursorConnection = (props, cursorName) => {
  const { nodes, totalCount, offset, limit, where, revert, orderBy } = props;

  const edges = nodes.map((node, index) =>
    nodeToEdge(node, cursorName, {
      offset: (offset || 0) + index + 1,
      limit,
      where: where || [],
      orderBy: orderBy || [],
    }),
  );
  const startCursor = edges.length ? edges[0].cursor : undefined;
  const endCursor = edges.length ? edges[edges.length - 1].cursor : undefined;
  const hasPreviousPage = revert ? (offset || 0) + limit < totalCount : (offset || 0) > 0;
  const hasNextPage = revert ? (offset || 0) > 0 : (offset || 0) + limit < totalCount;

  return {
    totalCount,
    edges,
    pageInfo: {
      startCursor,
      endCursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
};
