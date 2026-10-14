/**
 * GraphQL Cursor connection
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export interface CursorConnection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}
/**
 * GraphQL PageInfo
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo
 */
export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
/**
 * GraphQL Node type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Node
 */
export type Node<T, K extends string = 'id'> = T & {
  [key in K]: string;
};

/**
 * GraphQL Edge type
 * @see https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
 */
export interface Edge<T> {
  node: Node<T>;
  cursor: string;
}

/**
 * Arguments of a connection field.
 * `null` and `undefined` mean «not passed».
 */
export interface ConnectionArgs {
  readonly first?: number | null;
  readonly last?: number | null;
  readonly after?: string | null;
  readonly before?: string | null;
  /** Page navigation by number: used with `first` only, without cursors */
  readonly offset?: number | null;
}

/**
 * A value after a JSON round trip: dates become strings,
 * undefined keys disappear. This is how the filters come back from a cursor.
 */
export type JSONValue<T> = T extends Date
  ? string
  : T extends string | number | boolean | null | undefined
    ? T
    : T extends ReadonlyArray<infer U>
      ? Array<JSONValue<U>>
      : T extends object
        ? { [K in keyof T]: JSONValue<T[K]> }
        : string;

/**
 * Payload of a connection cursor: the filters of the first page and
 * the position of the record in the whole list
 */
export type ConnectionCursor<Filters = Record<string, unknown>> = JSONValue<Omit<Filters, 'offset'>> & {
  offset: number;
};

export interface ConnectionPayload<Filters = Record<string, unknown>> {
  /** LIMIT of the database query */
  readonly limit: number;
  /** OFFSET of the database query */
  readonly offset: number;
  /** Filters to apply (explicit arguments win over the cursor) and the offset of the page */
  readonly cursor: ConnectionCursor<Filters>;
}

export interface CursorCodecOptions {
  /**
   * HMAC-SHA256 key, at least 32 bytes.
   * Derive a dedicated key, e.g. from the JWT key:
   * `crypto.hkdfSync('sha256', jwtKey, '', 'connection-cursor', 32)`
   */
  readonly secret: string | Buffer;
}

/**
 * Signed cursors: `<base64url JSON>.<base64url HMAC-SHA256>`.
 * The payload is readable, but can not be changed without the secret.
 */
export interface CursorCodec {
  encode(payload: unknown): string;
  /** Throws GraphQLError «Invalid cursor» (code BAD_USER_INPUT) */
  decode<Payload = unknown>(cursor: string): Payload;
}

export interface ParseConnectionArgsOptions {
  readonly codec: CursorCodec;
  /** Max value of `first` / `last`. Default: no limit */
  readonly maxPageSize?: number;
}

export interface BuildConnectionOptions {
  /** The cursor returned by parseConnectionArgs */
  readonly cursor: { readonly offset: number };
  readonly codec: CursorCodec;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}
