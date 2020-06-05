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
    NOTIN = "notIn",
    LIKE = "like",
    ILIKE = "ilike",
    NULL = "IS NULL",
    NOTNULL = "IS NOT NULL"
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
export declare const makeNodeCursor: (cursorName: string, cursorPayload: ICursorPayload) => string;
export declare const getCursorPayload: (cursor: string) => ICursorPayload;
/**
 * Wrap node to cursor object
 * @param  {Node} node
 * @param  {TOrderBy} order
 */
export declare const nodeToEdge: <T>(node: Node<T>, cursorName: string, cursorPayload: ICursorPayload) => {
    node: Node<T>;
    cursor: string;
};
/**
 * Convert GraphQL OrderBy array to Knex OrderBy array format
 * @param { TOrderBy } orderBy Array of objects econtains { field: "", direction: "" }
 */
export declare const convertOrderByToKnex: (orderBy: TOrderBy) => TOrderByKnex;
export declare const convertJsonToKnex: <TRecord = any>(knexInstance: Knex<any, any[]>, json: {} | any[]) => Knex.Raw<TRecord>;
export declare const convertWhereToKnex: (builder: Knex.QueryBuilder<any, any>, whereClause: {
    [key: string]: string | number | boolean;
} | TWhere) => Knex.QueryBuilder<any, any>;
/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface ICursorConnection<T> {
    edges: Edge<T>[];
    pageInfo: IPageInfo;
    totalCount: number;
}
export declare const buildCursorConnection: <T>(props: ICursorConnectionProps<T>, cursorName?: string) => ICursorConnection<T>;
export declare const buildQueryFilter: <TArgs extends TInputFilter>(args: TArgs) => TOutputFilter;
/**
 * Return array of fields of node
 */
export declare const extractNodeField: <T, K extends "id" | keyof T | "createdAt" | "updatedAt">(nodes: Node<T>[], field: K) => Node<T>[K][];
/**
 * Returns node IDs array
 */
export declare const extractNodeIds: <T>(nodes: Node<T>[]) => Node<T>["id"][];
/**
 * Collate rows for dataloader response
 */
export declare const collateForDataloader: <T>(ids: string[], nodes: Node<T>[], returnUndefined?: boolean) => Node<T>[];
/**
 * Format array of IDs to object with id key
 */
export declare const arrayOfIdsToArrayOfObjectIds: (array: string[]) => {
    id: string;
}[];
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
export interface TInputFilter {
    first?: number;
    offset?: number;
    last?: number;
    after?: string;
    before?: string;
    orderBy?: TOrderBy;
    search?: TInputSearch;
    filter?: {
        [key: string]: TInputFilterValue | readonly string[] | readonly number[];
    };
}
declare type TInputFilterValue = string | number | boolean | null;
export declare type TInputSearch = ISearchSingleField | ISearchSingleField[] | ISearchMultipleFields;
interface ISearchSingleField {
    field: string;
    query: string;
}
interface ISearchMultipleFields {
    fields: string[];
    query: string;
}
export declare type TOutputSearch = Array<{
    field: string;
    query: string;
}>;
export interface TOutputFilter {
    limit: number;
    offset: number;
    orderBy: TOrderBy;
    where: TWhere;
    revert: boolean;
    search: TOutputSearch | false;
}
export interface ICursorPayload {
    offset: number;
    limit: number;
    where: TWhere;
    orderBy: TOrderBy;
}
export declare type TOrderBy = Array<{
    field: string;
    direction: IDirectionRange;
}>;
export declare type TOrderByKnex = Array<{
    column: string;
    order: IDirectionRange;
}>;
export declare type TWhere = Array<[string, TWhereAction, string | number | boolean | null | readonly string[] | readonly number[] | undefined]>;
export {};
