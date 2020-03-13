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
export const nodeToEdge = (node: Node): { node: Node; cursor: string } => {
  return {
    node,
    cursor: stringToCursor(String(node.cursor)),
  };
};

export const nodesListToEdges = (nodeList: Node[]) => {
  return nodeList.map(node => nodeToEdge(node));
};

const buildCursorConnection = (props: IProps): ICursorConnection => {
  const { nodes, totalCount } = props;

  const cursor = {
    totalCount,
    pageInfo: {
      startCursor: nodes.length ? stringToCursor(String(nodes[0].cursor)) : undefined,
      endCursor: nodes.length ? stringToCursor(String(nodes[nodes.length - 1].cursor)) : undefined,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    edges: nodesListToEdges(nodes),
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

interface IProps {
  totalCount: number;
  limit: number;
  nodes: Node[];
}

/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection {
  edges: Edge[];
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
export interface Edge {
  cursor: string;
  node: Node;
}

/**
 * GraphQL Node type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
 */
export interface Node {
  cursor: number;
  [key: string]: any;
}

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
