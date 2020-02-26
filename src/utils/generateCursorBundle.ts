export const stringToCursor = (str: string) => {
  return Buffer.from(str, 'binary').toString('base64');
};

export const cursorToString = (cursor: string) => {
  return Buffer.from(cursor, 'base64').toString('binary');
};

export const nodeToEdge = (node: Node): { node: Node; cursor: string } => {
  return {
    node,
    cursor: stringToCursor(String(node.cursor)),
  };
};

export const nodesListToEdges = (nodeList: Node[]) => {
  return nodeList.map(node => nodeToEdge(node));
};

const buildCursorBundle = (props: IProps): ICursorBundle => {
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

interface IProps {
  totalCount: number;
  limit: number;
  nodes: Node[];
}

export interface ICursorBundle {
  edges: Edge[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export interface IPageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Edge {
  cursor: string;
  node: Node;
}

export interface Node {
  cursor: number;
  [key: string]: any;
}

export default buildCursorBundle;
export { buildCursorBundle };
