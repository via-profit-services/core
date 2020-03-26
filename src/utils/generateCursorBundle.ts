// import * as Knex from 'knex';
import { ServerError } from '~/errorHandlers';

export enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Convert string to cursor base64 string
 * @param  {string} str
 */
export const stringToCursor = (str: string) => {
  return Buffer.from(String(str), 'utf8').toString('base64');
};

/**
 * Convert base64 cursor to string
 * @param  {string} str
 */
export const cursorToString = (cursor: string) => {
  return Buffer.from(cursor, 'base64').toString('utf8');
};

export const makeNodeCursor = <T>(node: Node<T> & { [key: string]: any }, order: TOrderBy) => {
  const payload = order.map(({ field, direction }) => {
    const value = field in node ? node[field] : '';
    return [field, value, direction];
  });

  return stringToCursor(JSON.stringify(payload));
};

export const getNodeCursor = (cursor: string): Array<[string, string | number | boolean, IDirectionRange]> => {
  const payload = cursorToString(cursor);

  try {
    return JSON.parse(payload);
  } catch (err) {
    throw new ServerError(`The cursor «${cursor}» is invalid because it contains the wrong JSON data`);
  }
};

/**
 * Wrap node to cursor object
 * @param  {Node} node
 */
export const nodeToEdge = <TNodeData>(node: Node<TNodeData>, order: TOrderBy): { node: TNodeData; cursor: string } => {
  return {
    node,
    cursor: makeNodeCursor(node, order),
  };
};

/**
 * Convert nodes array to array of cursors
 * @param {Array} nodes
 */
export const nodesToEdges = <TNodeData>(
  nodes: Array<Node<TNodeData>>,
  order: TOrderBy,
): Array<{ node: TNodeData; cursor: string }> => {
  return nodes.map(node => nodeToEdge<TNodeData>(node, order));
};

/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<TNodeData> {
  edges: Array<{
    node: TNodeData;
    cursor: string;
  }>;
  pageInfo: IPageInfo;
  totalCount: number;
}

interface ICursorConnectionProps<TNodeData> {
  totalCount: number;
  offset: number;
  limit: number;
  orderBy: TOrderBy;
  cursor: ICursor;
  nodes: Array<Node<TNodeData>>;
}

export const buildCursorConnection = <TNodeData>(
  props: ICursorConnectionProps<TNodeData>,
): ICursorConnection<TNodeData> => {
  const { nodes, totalCount, offset, limit, orderBy } = props;
  const edges = nodesToEdges(nodes, orderBy);
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
  where: Array<[string, '=' | '<' | '>', string | number | boolean | null]>;
  cursor: ICursor;
  offset: number;
  limit: number;
  revert: boolean;
  orderBy?: TOrderBy;
}

export const buildQueryFilter = <TArgs extends TInputFilter = {}>(args: TArgs): TOutputFilter => {
  const { first, last, after, before, offset, orderBy, filter } = args;

  const DEFAULT_LIMIT = 30;

  // convert cursor string to where clause array
  const cursorData = after || before ? getNodeCursor(after || before) : [];
  const cursor = cursorData.map(([field, value, direction]) => {
    return [field, direction === IDirectionRange.ASC ? '>' : '<', value];
  });

  // combine filter
  const outputFilter = {
    cursor,
    limit: first || last || DEFAULT_LIMIT,
    orderBy,
    revert: !!last,
    where: [],
    offset: Number(offset) || 0,
  } as TOutputFilter;

  Object.entries(filter).forEach(([field, value]) => {
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
 * GraphQL Edge type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
 */
export interface Edge<TNodeData> {
  node: TNodeData;
  cursor: string;
}

/**
 * GraphQL Node type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
 */
export type Node<TNodeData> = TNodeData & {
  id: string;
  createdAt: Date;
};

export type ICursor = Array<[string, '=' | '<' | '>', string | number | boolean | null]>;

export interface IListResponse<TNodeData> {
  totalCount: number;
  offset: number;
  limit: number;
  orderBy: TOrderBy;
  nodes: Node<TNodeData>[];
}

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
