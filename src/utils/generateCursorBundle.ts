import { ServerError } from '~/errorHandlers';

export enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Convert string to cursor base64 string
 * @param  {string} str
 */
export const stringToCursor = (str: string) => Buffer.from(String(str), 'utf8').toString('base64');

/**
 * Convert base64 cursor to string
 * @param  {string} str
 */
export const cursorToString = (cursor: string) => Buffer.from(cursor, 'base64').toString('utf8');

export const makeNodeCursor = (payload: ICursorPayload): string => {
  const {
    limit, offset, revert, id,
  } = payload;
  return stringToCursor(JSON.stringify([limit, offset, revert, id]));
};

export const getNodeCursor = (cursor: string): ICursorPayload => {
  const payload = cursorToString(cursor);

  try {
    const [limit, offset, revert, id] = JSON.parse(payload) as [number, number, boolean, string];
    return {
      limit,
      offset,
      revert,
      id,
    };
  } catch (err) {
    throw new ServerError(`The cursor «${cursor}» is invalid because it contains the wrong JSON data`);
  }
};

/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export const nodeToEdge = <T>(
  node: Node<T>,
  payload: Omit<ICursorPayload, 'id'>,
): { node: Node<T>; cursor: string } => ({
    node,
    cursor: makeNodeCursor({ ...payload, id: node.id }),
  });

/**
 * Convert nodes array to array of cursors
 * @param {Array} nodes
 */
export const nodesToEdges = <T>(
  nodes: Node<T>[],
  payload: Omit<ICursorPayload, 'id'>):
    Edge<T>[] => [...(nodes || [])].map((node) => nodeToEdge<T>(node, payload));

/**
 * Convert GraphQL OrderBy array to Knex OrderBy array format
 * @param { TOrderBy } orderBy Array of objects econtains { field: "", direction: "" }
 */
export const convertOrderByToKnex = (orderBy: TOrderBy):
  TOrderByKnex => [...(orderBy || [])].map(({ field, direction }) => ({
  column: field,
  order: direction,
}));

/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<T> {
  edges: Edge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export const buildCursorConnection = <T>(
  props: ICursorConnectionProps<T>): ICursorConnection<T> => {
  const {
    nodes, totalCount, offset, limit, revert,
  } = props;

  const edges = nodesToEdges(nodes, {
    limit,
    offset,
    revert: Boolean(revert),
  });
  const startCursor = edges.length ? edges[0].cursor : undefined;
  const endCursor = edges.length ? edges[edges.length - 1].cursor : undefined;
  const hasPreviousPage = offset > 0;
  const hasNextPage = offset + limit < totalCount;

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

export interface TOutputFilter {
  where: TWhere;
  offset: number;
  limit: number;
  revert: boolean;
  orderBy: TOrderBy;
  cursor?: ICursorPayload;
}

export const buildQueryFilter = <TArgs extends TInputFilter>(args: TArgs): TOutputFilter => {
  const {
    first, last, after, before, offset, orderBy, filter,
  } = args;

  const DEFAULT_LIMIT = 30;

  // combine filter
  const outputFilter = {
    limit: Math.max(Number(first || last) || DEFAULT_LIMIT, 0),
    orderBy: orderBy || [],
    revert: !!last,
    where: [],
    offset: Math.max(Number(offset) || 0, 0),
  } as TOutputFilter;

  if (after || before) {
    const cursor = getNodeCursor(after || before);
    outputFilter.limit = cursor.limit;
    outputFilter.offset = cursor.offset;
    outputFilter.revert = cursor.revert;
    outputFilter.cursor = cursor;
  }

  if (!outputFilter.orderBy.length) {
    outputFilter.orderBy.push({
      field: 'createdAt',
      direction: IDirectionRange.DESC,
    });
  }

  outputFilter.orderBy.push({
    field: 'id',
    direction: IDirectionRange.DESC,
  });

  Object.entries(filter || {}).forEach(([field, value]) => {
    outputFilter.where.push([field, '=', value]);
  });

  return outputFilter;
};

/**
 * GraphQL PageInfo
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo
 */
export interface IPageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * GraphQL Node type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
 */
export type Node<T> = T & {
  id: string;
  createdAt: Date;
};

/**
 * GraphQL Edge type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
 */
export interface Edge<T> {
  node: Node<T>;
  cursor: string;
}

export interface ICursorPayload {
  limit: number;
  offset: number;
  revert: boolean;
  id: string;
}

export interface IListResponse<T> {
  totalCount: number;
  offset: number;
  limit: number;
  nodes: Array<Node<T>>;
  revert?: boolean;
}

export type ICursorConnectionProps<T> = IListResponse<T>;

export interface TInputFilter {
  first?: number;
  offset?: number;
  last?: number;
  after?: string;
  before?: string;
  orderBy?: TOrderBy;
  filter?: {
    [key: string]: string | number | boolean | null;
  };
}

export type TOrderBy = Array<{
  field: string;
  direction: IDirectionRange;
}>;

export type TOrderByKnex = Array<{
  column: string;
  order: IDirectionRange;
}>;

export type TWhere = Array<[string, '=' | '<' | '>', '<=' | '>=' | string | number | boolean | null]>;
