export declare const stringToCursor: (str: string) => string;
export declare const cursorToString: (cursor: string) => string;
export declare const nodeToEdge: (node: Node) => {
    node: Node;
    cursor: string;
};
export declare const nodesListToEdges: (nodeList: Node[]) => {
    node: Node;
    cursor: string;
}[];
declare const buildCursorBundle: (props: IProps) => ICursorBundle;
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
