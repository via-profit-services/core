export enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Convert string to cursor base64 string
 * @param  {string} str
 */
export const stringToCursor = (str: string) => {
  return Buffer.from(str, 'binary').toString('base64');
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
export const nodeToEdge = <TNodeData>(node: Node<TNodeData>): { node: Node<TNodeData>; cursor: string } => {
  return {
    node,
    cursor: stringToCursor(String(node.cursor)),
  };
};

export const nodesListToEdges = <T>(nodeList: Node<T>[]) => {
  return nodeList.map(node => nodeToEdge<T>(node));
};

const buildCursorConnection = <T>(props: IProps<T>): ICursorConnection<T> => {
  const { nodes, totalCount } = props;

  const cursor = {
    totalCount,
    pageInfo: {
      startCursor: nodes.length ? stringToCursor(String(nodes[0].cursor)) : undefined,
      endCursor: nodes.length ? stringToCursor(String(nodes[nodes.length - 1].cursor)) : undefined,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    edges: nodesListToEdges<T>(nodes),
  };

  return cursor;
};

const buildQueryFilter = <TFilter extends TFilterDefaults = TFilterDefaults, TArgs extends TArgsDefaults = {}>(
  args: TArgs,
): TFilter & TFilterDefaults => {
  const { first, last, after, before, orderBy } = args;

  // combine filter
  const filter = {
    limit: first !== undefined ? first : last,
    orderBy: [
      {
        column: 'cursor',
        order: after !== undefined ? IDirectionRange.ASC : IDirectionRange.DESC,
      },
    ],
    where: {},
  } as TFilter;

  if (after !== undefined) {
    filter.after = Number(cursorToString(after));
  }

  if (before !== undefined) {
    filter.before = Number(cursorToString(before));
  }

  if (typeof orderBy === 'object') {
    filter.orderBy.unshift({
      column: orderBy.field,
      order: orderBy.direction,
    });
  }

  return filter;
};

interface IProps<T> {
  totalCount: number;
  limit: number;
  nodes: Node<T>[];
}

/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<TNode> {
  edges: Edge<TNode>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

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
export interface Edge<TNode> {
  cursor: string;
  node: TNode;
}

/**
 * GraphQL Node type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
 */
export type Node<TNodeData> = TNodeData & { cursor: string };

export interface IListResponse<TNode> {
  totalCount: number;
  nodes: TNode[];
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
}

interface TFilterDefaults {
  after?: number;
  before?: number;
  limit?: number;
  orderBy?: Array<{
    column: string;
    order: IDirectionRange;
  }>;
  where?: {};
}

export { buildCursorConnection, buildQueryFilter };
