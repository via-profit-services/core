import Knex from 'knex';
import { ServerError } from '~/errorHandlers';

export enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TWhereAction {
  EQ = '=',
  NEQ = '<>',
  GT = '>',
  LT = '<',
  GTE = '>=',
  LTE = '<=',
  IN = 'in',
  NOTIN = 'notIn',
  LIKE = 'like',
  ILIKE = 'ilike',
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
export const convertOrderByToKnex = (orderBy: TOrderBy | undefined):
  TOrderByKnex => [...(orderBy || [])].map(({ field, direction }) => ({
  column: field,
  order: direction,
}));


// eslint-disable-next-line arrow-body-style
export const convertJsonToKnex = <TRecord = any>(knexInstance: Knex, json: {} | Array<any>) => {
  return knexInstance.raw<TRecord>(`'${JSON.stringify(json)}'::jsonb`);
};


export const convertWhereToKnex = (builder: Knex.QueryBuilder, whereClause: {
  [key: string]: string | number | boolean | null;
} | TWhere) => {
  if (typeof whereClause === 'undefined') {
    return builder;
  }

  const whereArray: TWhere = [];
  // if is an array
  if (Array.isArray(whereClause)) {
    whereClause.forEach(([field, action, value]) => {
      whereArray.push([field, action, value]);
    });
  }

  if (!Array.isArray(whereClause)) {
    Object.entries(whereClause).forEach(([field, value]) => {
      whereArray.push([field, TWhereAction.EQ, value]);
    });
  }

  whereArray.forEach(([field, action, value]) => {
    switch (true) {
      case action === TWhereAction.IN:

        builder.whereIn(field, Array.isArray(value) ? value : [value] as Array<string | number>);
        break;

      case action === TWhereAction.NOTIN:
        builder.whereNotIn(field, Array.isArray(value) ? value : [value] as Array<string | number>);
        break;

      default:
        builder.where(field, action, value as string | number | boolean | null);
        break;
    }
  });


  return builder;
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


export const buildQueryFilter = <TArgs extends TInputFilter>(args: TArgs): TOutputFilter => {
  const {
    first,
    last,
    after,
    before,
    offset,
    orderBy,
    filter,
    search,
  } = args;

  const DEFAULT_LIMIT = 30;

  // combine filter
  const outputFilter = {
    limit: Math.max(Number(first || last) || DEFAULT_LIMIT, 0),
    orderBy: orderBy || [],
    revert: !!last,
    where: [],
    search: search || false,
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

  if (typeof filter !== 'undefined') {
    // if filter is an array
    if (Array.isArray(filter)) {
      outputFilter.where = filter;
    }

    if (!Array.isArray(filter)) {
      Object.entries(filter).forEach(([field, value]) => {
        outputFilter.where.push([field, TWhereAction.EQ, value]);
      });
    }
  }

  return outputFilter;
};

/**
 * Return array of fields of node
 */
export const extractNodeField = <T, K extends keyof Node<T>>(
  nodes: Node<T>[], field: K): Node<T>[K][] => {
  const elems = [...nodes].map((n) => n[field]);
  return elems;
};

/**
 * Returns node IDs array
 */
export const extractNodeIds = <T>(nodes: Node<T>[]) => extractNodeField<Node<T>, 'id'>(nodes, 'id');


/**
 * Collate rows for dataloader response
 */
export const collateForDataloader = <T>(
  ids: string[],
  nodes: Array<Node<T>>,
  returnUndefined?: boolean,
) => ids.map((id) => nodes.find((node) => node.id === id) || (returnUndefined ? undefined : null));


/**
 * Format array of IDs to object with id key
 */
export const arrayOfIdsToArrayOfObjectIds = (array: string[]) => {
  return array.length
    ? array.map((id) => ({ id }))
    : null;
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
  search?: IInputSearch;
  filter?: {
    [key: string]: string | number | boolean | null;
  } | TWhere;
}

export interface IInputSearch {
  field: string;
  query: string;
}

export interface TOutputFilter {
  limit: number;
  offset: number;
  orderBy: TOrderBy;
  where: TWhere;
  revert: boolean;
  search: IInputSearch | false;
  cursor?: ICursorPayload;
}

export type TOrderBy = Array<{
  field: string;
  direction: IDirectionRange;
}>;

export type TOrderByKnex = Array<{
  column: string;
  order: IDirectionRange;
}>;


export type TWhere = Array<[
  string,
  TWhereAction,
  string | number | boolean | null | readonly string[] | readonly number[]
]>;
