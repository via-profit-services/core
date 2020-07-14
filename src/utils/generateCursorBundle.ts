import Knex from 'knex';
import { ServerError } from '../errorHandlers';

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
  NULL = 'IS NULL',
  NOTNULL = 'IS NOT NULL',
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


export const makeNodeCursor = (cursorName: string, cursorPayload: ICursorPayload): string => {
  return stringToCursor([
    JSON.stringify(cursorPayload),
    cursorName,
  ].join('---'));
};

export const getCursorPayload = (cursor: string): ICursorPayload => {
  try {
    const cursorPayload = cursorToString(cursor).split('---')[0] || '';
    return JSON.parse(cursorPayload);
  } catch (err) {
    throw new ServerError('Failed to decode cursor payload', { err });
  }
};


/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export const nodeToEdge = <T>(node: Node<T>, cursorName: string, cursorPayload: ICursorPayload): {
  node: Node<T>;
  cursor: string
} => ({
    node,
    cursor: makeNodeCursor(cursorName, cursorPayload),
  });


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


export const convertBetweenToKnex = (
  /**
   * Put your Knex builder \
   * For example: `knex('table').where((builder) => convertBetweenToKnex(builder, between))`
   */
  builder: Knex.QueryBuilder,
  between: TBetween | undefined,
  aliases?: TTableAliases,
) => {
  if (typeof between === 'undefined') {
    return builder;
  }

  const aliasesMap = new Map<string, string>();
  Object.entries(aliases || {}).forEach(([tableName, field]) => {
    const fieldsArray = Array.isArray(field) ? field : [field];
    fieldsArray.forEach((fieldName) => {
      aliasesMap.set(fieldName, tableName);
    });
  });

  Object.entries(between).forEach(([field, betweenData]) => {
    const alias = aliasesMap.get(field) || aliasesMap.get('*');
    builder.whereBetween(
      alias ? `${alias}.${field}` : field,
      [betweenData.start, betweenData.end],
    );
  });

  return builder;
};

export const applyAliases = (
  whereClause: TWhere,
  aliases: TTableAliases,
): TWhere => {
  const aliasesMap = new Map<string, string>();
  Object.entries(aliases).forEach(([tableName, field]) => {
    const fieldsArray = Array.isArray(field) ? field : [field];
    fieldsArray.forEach((fieldName) => {
      aliasesMap.set(fieldName, tableName);
    });
  });

  const newWhere = whereClause.map((data) => {
    const [field, action, value] = data;
    const alias = aliasesMap.get(field) || aliasesMap.get('*');

    return [
      alias ? `${alias}.${field}` : field,
      action,
      value,
    ];
  });

  return newWhere as TWhere;
};

export const convertWhereToKnex = (
  /**
   * Put your Knex builder \
   * For example: `knex('table').where((builder) => convertWhereToKnex(builder, where))`
   */
  builder: Knex.QueryBuilder,

  /**
   * Just `TWhere` array
   */
  whereClause: {
      [key: string]: string | number | boolean | null;
    } | TWhere,
  aliases?: TTableAliases,
) => {
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

  [...(aliases
    ? applyAliases(whereArray, aliases)
    : whereArray),
  ].forEach(([field, action, value]) => {
    switch (true) {
      case action === TWhereAction.IN:

        builder.whereIn(field, Array.isArray(value) ? value : [value] as Array<string | number>);
        break;

      case action === TWhereAction.NOTIN:
        builder.whereNotIn(field, Array.isArray(value) ? value : [value] as Array<string | number>);
        break;

      case action === TWhereAction.NULL:
        builder.whereNull(field);
        break;

      case action === TWhereAction.NOTNULL:
        builder.whereNotNull(field);
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
  props: ICursorConnectionProps<T>,
  cursorName?: string): ICursorConnection<T> => {
  const {
    nodes,
    totalCount,
    offset,
    limit,
    where,
    orderBy,
  } = props;

  // const edges = nodesToEdges(nodes, cursorName);
  const edges = nodes.map((node, index) => {
    return nodeToEdge(node, cursorName, {
      offset: (offset || 0) + index + 1,
      limit,
      where: where || [],
      orderBy: orderBy || [],
    });
  });
  const startCursor = edges.length ? edges[0].cursor : undefined;
  const endCursor = edges.length ? edges[edges.length - 1].cursor : undefined;
  const hasPreviousPage = (offset || 0) > 0;
  const hasNextPage = (offset || 0) + limit < totalCount;

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
    between,
  } = args;

  const DEFAULT_LIMIT = 30;


  // combine filter
  const outputFilter: TOutputFilter = {
    limit: Math.max(Number(first || last) || DEFAULT_LIMIT, 0),
    orderBy: orderBy || [],
    revert: !!last,
    where: [],
    search: false,
    offset: Math.max(Number(offset) || 0, 0),
    between: between || {},
  };


  // if cursor was provied in after or before property
  if (after || before) {
    const cursorPayload = getCursorPayload(after || before);
    return {
      ...outputFilter,
      ...cursorPayload,
    };
  }

  // compile filter
  if (typeof filter !== 'undefined') {
    // if filter is an array
    if (Array.isArray(filter)) {
      outputFilter.where = filter;
    }

    if (!Array.isArray(filter)) {
      Object.entries(filter).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          outputFilter.where.push([field, TWhereAction.IN, value]);
        } else {
          outputFilter.where.push([field, TWhereAction.EQ, value]);
        }
      });
    }
  }


  // if search is an array of single field
  if (search && Array.isArray(search)) {
    outputFilter.search = search as TOutputSearch;
  }

  // if search is a object with simgle field
  if (search && 'field' in search) {
    outputFilter.search = [search];
  }

  // if search is object with multiple fields
  if (search && 'fields' in search && Array.isArray(search.fields)) {
    outputFilter.search = search.fields.map((field) => ({
      field,
      query: search.query,
    }));
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
  updatedAt: Date;
};

/**
 * GraphQL Edge type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
 */
export interface Edge<T> {
  node: Node<T>;
  cursor: string;
}

export interface IListResponse<T> {
  totalCount: number;
  offset: number;
  limit: number;
  nodes: Array<Node<T>>;
  orderBy: TOrderBy;
  where: TWhere;
  revert?: boolean;
}

export interface ICursorConnectionProps<T> {
  totalCount: number;
  limit: number;
  nodes: Array<Node<T>>;
  offset?: number;
  orderBy?: TOrderBy;
  where?: TWhere;
  revert?: boolean;
}

export interface IBetweenDate {
  start: Date;
  end: Date;
}

export interface IBetweenTime {
  start: string;
  end: string;
}
export interface IBetweenDateTime {
  start: Date;
  end: Date;
}

export interface IBetweenInt {
  start: number;
  end: number;
}

export interface IBetweenMoney {
  start: number;
  end: number;
}

export interface TBetween {
  [key: string]: IBetweenDate | IBetweenTime | IBetweenDateTime | IBetweenInt | IBetweenMoney;
}


export interface TInputFilter {
  first?: number;
  offset?: number;
  last?: number;
  after?: string;
  before?: string;
  orderBy?: TOrderBy;
  search?: TInputSearch;
  between?: TBetween;
  filter?: {
    [key: string]: TInputFilterValue | readonly string[] | readonly number[];
  };
}

type TInputFilterValue = string | number | boolean | null;


export type TInputSearch = ISearchSingleField | ISearchSingleField[] | ISearchMultipleFields;


interface ISearchSingleField {
  field: string;
  query: string;
}

interface ISearchMultipleFields {
  fields: string[];
  query: string;
}


export type TOutputSearch = Array<{
  field: string;
  query: string;
}>

export interface TOutputFilter {
  limit: number;
  offset: number;
  orderBy: TOrderBy;
  where: TWhere;
  revert: boolean;
  search: TOutputSearch | false;
  between: TBetween;
}

export interface ICursorPayload {
  offset: number;
  limit: number;
  where: TWhere,
  orderBy: TOrderBy;
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
  string | number | boolean | null | readonly string[] | readonly number[] | undefined
]>;

/**
   * Key - is a alias name \
   * Value - is a field alias name or array of names \
   * Use asterisk (\*) for default alias name. \
   * For example: {\
   * books: ['title', 'length'],\
   * info: ['*'],\
   * }
   */
export type TTableAliases = {
  [key: string]: string | string[];
};
