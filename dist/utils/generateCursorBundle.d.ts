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
export declare const makeNodeCursor: <T>(node: T & {
    id: string;
    createdAt: Date;
} & {
    [key: string]: any;
}, order: TOrderBy) => string;
export declare const getNodeCursor: (cursor: string) => ICursor;
/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export declare const nodeToEdge: <T>(node: Node<T>, order: TOrderBy) => {
    node: Node<T>;
    cursor: string;
};
/**
 * Convert nodes array to array of cursors
 * @param {Array} nodes
 */
export declare const nodesToEdges: <T>(nodes: Node<T>[], order: TOrderBy) => Edge<T>[];
/**
 * Convert GraphQL OrderBy array to Knex OrderBy array format
 * @param { TOrderBy } orderBy Array of objects econtains { field: "", direction: "" }
 */
export declare const convertOrderByToKnex: (orderBy: TOrderBy) => TOrderByKnex;
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
export declare const buildCursorConnection: <T>(props: ICursorConnectionProps<T>) => ICursorConnection<T>;
export interface TOutputFilter {
    where: Array<[string, '=' | '<' | '>', string | number | boolean | null]>;
    cursor: ICursor;
    offset: number;
    limit: number;
    revert: boolean;
    orderBy?: TOrderBy;
}
export declare const buildQueryFilter: <TArgs extends TInputFilter = {}>(args: TArgs) => TOutputFilter;
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
export declare type Node<T> = T & {
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
export declare type ICursor = Array<[string, '=' | '<' | '>', string | number | boolean | null]>;
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
export declare type TOrderBy = Array<{
    field: string;
    direction: IDirectionRange;
}>;
export declare type TOrderByKnex = Array<{
    column: string;
    order: IDirectionRange;
}>;
export {};
