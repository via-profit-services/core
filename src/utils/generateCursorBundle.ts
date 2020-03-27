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

export const makeNodeCursor = <T>(node: Node<T> & { [key: string]: any }, order: TOrderBy): string => {
  const payload = order.map(({ field, direction }) => {
    const value = field in node ? node[field] : '';
    return [field, value, direction];
  });

  return stringToCursor(JSON.stringify(payload));
};

export const getNodeCursor = (cursor: string): ICursor => {
  const payload = cursorToString(cursor);

  try {
    const cursorData = JSON.parse(payload) as Array<[string, string | number | boolean, IDirectionRange]>;
    return cursorData.map(([field, value, direction]) => {
      return [field, direction === IDirectionRange.ASC ? '>' : '<', value];
    });
  } catch (err) {
    throw new ServerError(`The cursor «${cursor}» is invalid because it contains the wrong JSON data`);
  }
};

/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export const nodeToEdge = <T>(node: Node<T>, order: TOrderBy): { node: Node<T>; cursor: string } => {
  return {
    node,
    cursor: makeNodeCursor(node, order),
  };
};

/**
 * Convert nodes array to array of cursors
 * @param {Array} nodes
 */
export const nodesToEdges = <T>(nodes: Node<T>[], order: TOrderBy): Edge<T>[] => {
  return nodes.map(node => nodeToEdge<T>(node, order));
};

/**
 * Convert GraphQL OrderBy array to Knex OrderBy array format
 * @param { TOrderBy } orderBy Array of objects econtains { field: "", direction: "" }
 */
export const convertOrderByToKnex = (orderBy: TOrderBy): TOrderByKnex => {
  return orderBy.map(({ field, direction }) => ({
    column: field,
    order: direction,
  }));
};

/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<T> {
  edges: Edge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

interface ICursorConnectionProps<T> {
  totalCount: number;
  offset: number;
  limit: number;
  orderBy: TOrderBy;
  nodes: Node<T>[];
}

export const buildCursorConnection = <T>(props: ICursorConnectionProps<T>): ICursorConnection<T> => {
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

  // combine filter
  const outputFilter = {
    cursor: after || before ? getNodeCursor(after || before) : [],
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

export type ICursor = Array<[string, '=' | '<' | '>', string | number | boolean | null]>;

export interface IListResponse<T> {
  totalCount: number;
  offset: number;
  limit: number;
  orderBy: TOrderBy;
  nodes: Array<Node<T>>;
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

export type TOrderByKnex = Array<{
  column: string;
  order: IDirectionRange;
}>;
