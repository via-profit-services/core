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
export declare const nodeToEdge: <TNodeData>(node: TNodeData & {
    cursor: number;
}) => {
    node: TNodeData;
    cursor: string;
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
    nodes: Array<TNodeData & {
        cursor: number;
    }>;
}
declare const buildCursorConnection: <TNodeData>(props: ICursorConnectionProps<TNodeData>) => ICursorConnection<TNodeData>;
declare const buildQueryFilter: <TFilter extends TFilterDefaults = TFilterDefaults, TArgs extends TArgsDefaults = {}>(args: TArgs) => TFilter & TFilterDefaults;
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
export declare type Node<TNodeData> = TNodeData;
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
