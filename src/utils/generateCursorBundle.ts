import * as Knex from 'knex';

export enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Convert string to cursor base64 string
 * @param  {string} str
 */
export const stringToCursor = (str: string | number) => {
  return Buffer.from(String(str), 'binary').toString('base64');
};

/**
 * Convert base64 cursor to string
 * @param  {string} str
 */
export const cursorToString = (cursor: string) => {
  return Buffer.from(cursor, 'base64').toString('binary');
};

/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @returns string
 */
export const nodeToEdge = <TNodeData>(
  node: Node<TNodeData & { cursor: number }>,
): { node: TNodeData; cursor: string } => {
  const { cursor } = node;
  return {
    node,
    cursor: stringToCursor(cursor.toString()),
  };
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
  limit: number;
  nodes: Array<TNodeData & { cursor: number }>;
}

const buildCursorConnection = <TNodeData>(props: ICursorConnectionProps<TNodeData>): ICursorConnection<TNodeData> => {
  const { nodes, totalCount } = props;

  return {
    totalCount,
    pageInfo: {
      startCursor: nodes.length ? stringToCursor(String(nodes[0].cursor)) : undefined,
      endCursor: nodes.length ? stringToCursor(String(nodes[nodes.length - 1].cursor)) : undefined,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    edges: nodes.map(node => nodeToEdge<TNodeData>(node)),
  };
};

export interface IGraphQLFilterDefaults {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  limit?: number;
  orderBy?: Array<{
    field: string;
    direction: IDirectionRange;
  }>;
  where: {
    [key: string]: string;
  };
}

export interface IKnexFilterDefaults {
  where: (builder: Knex.QueryBuilder) => Knex.QueryBuilder;
  limit: number;
  orderBy?: Array<{
    column: string;
    order: IDirectionRange;
  }>;
}

const buildQueryFilter = <TArgs extends TArgsDefaults = {}>(args: TArgs): IKnexFilterDefaults => {
  const { first, last, after, before, orderBy, where } = args;

  // combine filter
  const filter = {
    limit: first !== undefined ? first : last,
    orderBy: [
      {
        column: 'cursor',
        order: IDirectionRange.ASC,
      },
    ],
    where: {},
  } as IKnexFilterDefaults;

  if (typeof orderBy === 'object') {
    filter.orderBy.unshift({
      column: orderBy.field,
      order: orderBy.direction,
    });
  }

  filter.where = builder => {
    if (after !== undefined) {
      builder.where('cursor', '>', Number(cursorToString(after)));
    }

    if (before !== undefined) {
      builder.where('cursor', '<', Number(cursorToString(before)));
    }

    if (where !== undefined) {
      builder.where(where);
    }

    return builder;
  };

  return filter;
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
export type Node<TNodeData> = TNodeData;

export interface IListResponse<TNodeData> {
  totalCount: number;
  nodes: Node<TNodeData>[];
  limit: number;
}

interface TArgsDefaults {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  orderBy?: {
    field: string;
    direction: IDirectionRange;
  };
  where?: Knex.Where;
}

export { buildCursorConnection, buildQueryFilter };
