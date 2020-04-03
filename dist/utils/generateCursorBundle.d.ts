import Knex from 'knex';
export declare enum IDirectionRange {
    ASC = "ASC",
    DESC = "DESC"
}
export declare enum TWhereAction {
    EQ = "=",
    NEQ = "<>",
    GT = ">",
    LT = "<",
    GTE = ">=",
    LTE = "<=",
    IN = "in",
    NOTIN = "notIn"
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
export declare const makeNodeCursor: (payload: ICursorPayload) => string;
export declare const getNodeCursor: (cursor: string) => ICursorPayload;
/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export declare const nodeToEdge: <T>(node: Node<T>, payload: Pick<ICursorPayload, "limit" | "offset" | "revert">) => {
    node: Node<T>;
    cursor: string;
};
/**
 * Convert nodes array to array of cursors
 * @param {Array} nodes
 */
export declare const nodesToEdges: <T>(nodes: Node<T>[], payload: Pick<ICursorPayload, "limit" | "offset" | "revert">) => Edge<T>[];
/**
 * Convert GraphQL OrderBy array to Knex OrderBy array format
 * @param { TOrderBy } orderBy Array of objects econtains { field: "", direction: "" }
 */
export declare const convertOrderByToKnex: (orderBy: TOrderBy) => TOrderByKnex;
export declare const convertWhereToKnex: (builder: Knex.QueryBuilder<any, any>, whereClause: TWhere | {
    [key: string]: string | number | boolean;
}) => Knex.QueryBuilder<any, any>;
/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<T> {
    edges: Edge<T>[];
    pageInfo: IPageInfo;
    totalCount: number;
}
export declare const buildCursorConnection: <T>(props: ICursorConnectionProps<T>) => ICursorConnection<T>;
export declare const buildQueryFilter: <TArgs extends TInputFilter>(args: TArgs) => TOutputFilter;
/**
 * Return array of fields of node
 */
export declare const extractNodeField: <T, K extends "id" | "createdAt" | keyof T>(nodes: Node<T>[], field: K) => Node<T>[K][];
/**
 * Returns node IDs array
 */
export declare const extractNodeIds: <T>(nodes: Node<T>[]) => Node<T>["id"][];
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
export declare type ICursorConnectionProps<T> = IListResponse<T>;
export interface TInputFilter {
    first?: number;
    offset?: number;
    last?: number;
    after?: string;
    before?: string;
    orderBy?: TOrderBy;
    filter?: {
        [key: string]: string | number | boolean | null;
    } | TWhere;
}
export interface TOutputFilter {
    offset: number;
    limit: number;
    revert?: boolean;
    orderBy?: TOrderBy;
    where?: TWhere;
    cursor?: ICursorPayload;
}
export declare type TOrderBy = Array<{
    field: string;
    direction: IDirectionRange;
}>;
export declare type TOrderByKnex = Array<{
    column: string;
    order: IDirectionRange;
}>;
export declare type TWhere = Array<[string, TWhereAction, string | number | boolean | null | readonly string[] | readonly number[]]>;
