export declare enum IDirectionRange {
    ASC = "ASC",
    DESC = "DESC"
}
/**
 * Convert string to cursor base64 string
 * @param  {string} str
 */
export declare const stringToCursor: (str: string) => string;
/**
 * Convert base64 cursor to string
 * @param  {string} str
 */
export declare const cursorToString: (cursor: string) => string;
/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @returns string
 */
export declare const nodeToEdge: <TNodeData>(node: Node<TNodeData>) => {
    node: Node<TNodeData>;
    cursor: string;
};
export declare const nodesListToEdges: <T>(nodeList: Node<T>[]) => {
    node: Node<T>;
    cursor: string;
}[];
declare const buildCursorConnection: <T>(props: IProps<T>) => ICursorConnection<T>;
declare const buildQueryFilter: <TFilter extends TFilterDefaults = TFilterDefaults, TArgs extends TArgsDefaults = {}>(args: TArgs) => TFilter & TFilterDefaults;
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
export declare type Node<TNodeData> = TNodeData & {
    cursor: string;
};
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
