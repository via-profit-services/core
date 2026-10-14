import type http from 'node:http';
import type { GraphQLError, GraphQLFormattedError, GraphQLSchema } from 'graphql';

import type { Middleware } from '../middleware/types';
import type { MaybePromise } from '../utils/types';

export interface InitProps {
  /**
   * GraphQL Schema Definition
   * @see: https://graphql.org
   */
  readonly schema: GraphQLSchema;
  /**
   * Persisted Queries map (Object contains key: value pairs). \
   * If persisted queries map is passed, the server will ignore \
   * the query directive in body request and read the map \
   * @see https://relay.dev/docs/en/persisted-queries.html
   */
  readonly persistedQueriesMap?: PersistedQueriesMap;
  /**
   * Used only together with the `persistedQueriesMap` option.\
   * The name of the parameter that will be passed the ID of the query in the Persisted Queries map.
   * \
   * Default: `documentId`
   */
  readonly persistedQueryKey?: string;
  /**
   * Diagnostics of the server for development. Adds to the response:
   * - `extensions.queryTime`, `requestCounter`, `startupTime`, `diagnostics`
   *   (timing of the steps, document cache, operation name);
   * - `extensions.limits` (as `limits.exposeUsage`);
   * - `stacktrace` to every error.
   *
   * The fields added by the project (`setExtension`, middleware) and
   * `extensions.requestId` are sent regardless of this option.
   * Do not enable in production: stack traces reveal the code.
   *
   * Default: `false`
   */
  readonly debug?: boolean;

  /**
   * This value will be passed to  method execute of the graphql package as is
   */
  readonly rootValue?: unknown;

  /**
   * Middleware function or array of middlewares
   */
  readonly middleware?: Middleware | Middleware[];

  /**
   * **Legacy mode. Do not use it in new projects.**
   *
   * By default every HTTP request receives its own empty `context` object.
   * Middlewares fill it and resolvers of this request read it.
   *
   * If `true`, a single context object is created once and is shared by
   * **all** requests, including concurrent ones (behavior of versions <= 2.10).
   * Anything a middleware writes into it (user, token, locale...) becomes
   * visible to other requests. Use it only for code that stores long-living
   * objects (DB pools, loggers) in the context and was not migrated yet.
   *
   * Default: `false`
   * @deprecated
   */
  readonly sharedContext?: boolean;

  readonly limits?: Partial<Limits>;

  /**
   * Hide internal error messages from clients.
   *
   * If `true`, an error thrown by a resolver or a middleware that is NOT a
   * `GraphQLError` (a plain `Error`, a database driver error...) is sent to
   * the client as `"Internal server error"` with
   * `extensions.code = "INTERNAL_SERVER_ERROR"`.
   * Throw `GraphQLError` for messages the client must see:
   * ```ts
   * throw new GraphQLError('Access denied', { extensions: { code: 'FORBIDDEN' } });
   * ```
   * Validation and request errors of the core are never masked.
   * Use `onError` to log the original errors.
   *
   * Recommended for production. Default: `false`
   */
  readonly maskErrors?: boolean;

  /**
   * Called with the original error of every error of a response
   * (before masking). Use it for logging.
   */
  readonly onError?: (error: Error) => void;

  /**
   * CSRF protection.
   *
   * A browser sends `GET` and `multipart/form-data` POST requests to any
   * site without a CORS preflight, together with the cookies of that site.
   * If authorization relies on cookies, a foreign page can execute a
   * mutation (e.g. an upload) on behalf of the user.
   *
   * If `true`, such requests must contain one of the headers
   * `x-requested-with`, `apollo-require-preflight`, `x-apollo-operation-name`
   * or `graphql-preflight` (any non-empty value). A browser cannot add
   * them cross-origin without a preflight. `application/json` POST requests
   * always require a preflight and are not affected.
   *
   * Recommended if cookies are used for authorization. Default: `false`
   */
  readonly csrfPrevention?: boolean;

  /**
   * Accept only queries from `persistedQueriesMap`.
   * A request with an arbitrary query text is rejected.
   *
   * Default: `false`
   */
  readonly persistedQueriesOnly?: boolean;

  /**
   * Allow introspection queries (`__schema`, `__type`).
   * Set `false` in production if the schema must not be discoverable.
   * `__typename` is always allowed.
   *
   * Default: `true`
   */
  readonly introspection?: boolean;
}

/**
 * How much of a limit a request used. `max` is `null` when the limit is disabled.
 */
export interface LimitUsage {
  readonly value: number;
  readonly max: number | null;
}

/**
 * Measured values of a request against the limits.
 * Only the measured values are present: e.g. a request rejected while
 * reading the body has no `depth`.
 */
export interface LimitsUsage {
  /** Operation name from the request, `null` for an anonymous operation */
  readonly operationName: string | null;
  /** Size of the JSON body on the wire, bytes (against `maxJSONBodySize`) */
  readonly bodySize?: LimitUsage;
  /** Number of uploaded files (against `maxFiles`) */
  readonly files?: LimitUsage;
  /** Total size of uploaded files, bytes (against `maxFilesTotalSize`) */
  readonly filesTotalSize?: LimitUsage;
  /** Tokens of the document (against `maxGraphQLTokens`) */
  readonly tokens?: LimitUsage;
  /** Depth, the largest of all operations (against `maxGraphQLDepthLimit`) */
  readonly depth?: LimitUsage;
  /** Complexity, the largest of all operations (against `complexityLimit.maxComplexity`) */
  readonly complexity?: LimitUsage;
  /** Most fields in one selection set (against `complexityLimit.maxFieldsPerSelection`) */
  readonly width?: LimitUsage;
}

export interface Limits {
  /**
   * Send `extensions.limits` (how much of every limit the request used)
   * in every response. Always on with `debug: true`.
   *
   * The values reveal the configured limits. Those can be found by probing
   * anyway, but keep it off unless the clients need it.
   *
   * Default: `false`
   */
  readonly exposeUsage?: boolean;

  /**
   * Called for every request whose document was parsed, also for requests
   * rejected by a limit. Works in production without exposing anything to
   * the client: collect the values (histogram, log) and set the limits from
   * real traffic instead of guessing them.
   *
   * An exception thrown here is passed to `onError` and does not affect the request.
   */
  readonly onUsage?: (usage: LimitsUsage, context: Context) => void;

  /**
   * Maximum allowed size of a non-file field value in multipart/form-data (in bytes).
   * This applies to fields like "operations" and "map" when using multipart parser.
   * Helps prevent oversized JSON payloads inside multipart requests.
   *
   * Default: 1 MB
   */
  readonly maxFieldSize?: number;

  /**
   * Maximum allowed size of a single uploaded file (in bytes).
   * The request is rejected as soon as a file exceeds the limit.
   *
   * Default: 10 MB
   */
  readonly maxFileSize?: number;

  /**
   * Maximum number of file fields allowed in a multipart/form-data request.
   * Prevents clients from uploading too many files in a single operation.
   *
   * Default: 20
   */
  readonly maxFiles?: number;

  /**
   * Maximum number of non-file fields allowed in a multipart/form-data request.
   * Typically used to restrict "operations" and "map" fields.
   *
   * Default: 6
   */
  readonly maxFileFields?: number;

  /**
   * Maximum number of total parts (fields + files) allowed in a multipart request.
   * Protects against multipart flooding attacks.
   *
   * Default: 26 (maxFiles + maxFileFields)
   */
  readonly maxFileParts?: number;

  /**
   * Maximum combined size of all uploaded files in a single request (in bytes).
   * This limit is enforced manually by summing incoming file chunks.
   */
  readonly maxFilesTotalSize?: number;

  /**
   * Maximum allowed size of a JSON request body (in bytes).
   * Applies to standard GraphQL POST requests with application/json.
   */
  readonly maxJSONBodySize?: number;

  /**
   * Maximum allowed size (in bytes) of the request body *after* decompression.
   *
   * This limit protects the server from gzip/deflate bomb attacks, where a very small
   * compressed payload expands into an extremely large body during decompression.
   *
   * If the decompressed body exceeds this threshold, the request is rejected before
   * parsing to prevent excessive memory usage and potential denial‑of‑service scenarios.
   */
  readonly maxJSONBodyDecompressedSize?: number;

  /**
   * Maximum number of tokens in a GraphQL document.
   * The parser stops as soon as the limit is reached.
   *
   * Default: 10 000
   */
  readonly maxGraphQLTokens?: number;

  /**
   * Maximum allowed GraphQL query depth.
   * Depth is measured by nested selection sets, not by number of fields.
   * Helps prevent deeply nested queries that may cause excessive resolver work.
   * Fragments do not add a level. `0` disables the check.
   * Default: 20
   */
  readonly maxGraphQLDepthLimit?: number;

  /**
   * Maximum allowed depth for introspection queries.
   * Introspection fields (e.g., __schema, __type) can be restricted separately
   * to reduce server load and limit schema exposure.
   */
  readonly maxGraphQLIntrospectionDepthLimit?: number;

  /**
   * Maximum allowed GraphQL query complexity score.
   * Complexity is calculated based on field cost, nesting, and list multipliers.
   * Helps prevent expensive queries that may overload the server.
   */
  readonly complexityLimit?: ComplexityLimitOptions;
}

export interface ComplexityLimitOptions {
  /**
   * Maximum allowed total complexity for a GraphQL operation.
   * `0` disables the check.
   * Default: 50 000
   */
  maxComplexity?: number;

  /**
   * Base cost for each field. Default: 1.
   */
  fieldCost?: number;

  /**
   * Argument names that represent list size (e.g. first, last, limit).
   * These arguments multiply the field cost: the value of a literal,
   * a variable or the default value of the argument in the schema.
   */
  listArguments?: string[];

  /**
   * Default multiplier for list fields when no list argument is provided.
   * Useful when list size is unknown but should be treated as expensive.
   */
  defaultListMultiplier?: number;

  /**
   * Additional cost applied to introspection fields (__schema, __type).
   * Default: same as fieldCost.
   */
  introspectionCost?: number;

  /**
   * Maximum number of fields allowed inside a single selection set.
   * Helps prevent extremely wide queries.
   */
  maxFieldsPerSelection?: number;

  /**
   * Callback invoked after complexity is calculated.
   * Useful for logging or rate limiting.
   */
  onComplete?: (complexity: number, info: { operationName: string; width: number }) => void;

  /**
   * Custom error factory for overriding the default error message.
   */
  createError?: (max: number, actual: number) => GraphQLError;
}

/**
 * Context of a request. Empty in the core: a project describes its fields
 * with declaration merging:
 *
 * ```ts
 * declare module '@via-profit-services/core' {
 *   interface Context {
 *     user?: User;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by projects
export interface Context {}

export type CoreStats = {
  requestCounter: number;
  readonly startupTime: Date;
};

export type HTTPListener = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => MaybePromise<GraphqlResponse>;

export type GraphqlResponse = {
  data?: Record<string, any> | null;
  errors?: readonly GraphQLFormattedError[] | null;
  extensions?: GraphQLExtensions;

  /**
   * Recommended HTTP status code of the response.
   *
   * - `200` - the operation was executed (also with errors: partial success);
   * - `400` - malformed request, syntax or validation error;
   * - `401` / `403` - an error with `extensions.code` `UNAUTHENTICATED` / `FORBIDDEN`;
   * - `405` - unsupported HTTP method, mutation via GET (send `Allow: GET, POST`);
   * - `413` - the body, a file or a multipart limit is too large;
   * - `415` - unsupported Content-Type or Content-Encoding;
   * - `500` - unexpected server error.
   *
   * A `GraphQLError` thrown before execution (e.g. in a middleware) may set
   * its own status: `extensions: { http: { status: 401 } }`.
   *
   * **Non-enumerable**: it is not serialized by `JSON.stringify(response)`
   * and is not copied by `{ ...response }`, so the response body keeps
   * only `data`, `errors` and `extensions` as the GraphQL spec requires.
   * Read it explicitly: `res.statusCode = response.status ?? 200`.
   *
   * Always set by the core (since 2.12).
   */
  readonly status?: number;
};

/**
 * Timing and other internals of a request (only with `debug: true`)
 */
export interface RequestDiagnostics {
  readonly operationName: string | null;
  /** The query came from the persisted queries map */
  readonly persisted: boolean;
  /** The parsed and validated document was taken from the cache */
  readonly documentCache: 'hit' | 'miss';
  /** Milliseconds spent in every step; a step that did not run is absent */
  readonly timing: {
    readonly middlewares?: number;
    readonly body?: number;
    readonly document?: number;
    readonly validation?: number;
    readonly execution?: number;
  };
}

/**
 * `extensions` of a response.
 *
 * - fields added by the project (`setExtension`, middleware) and `requestId`: always;
 * - `limits`: with `limits.exposeUsage` or `debug`;
 * - `queryTime`, `requestCounter`, `startupTime`, `diagnostics`: only with `debug`.
 */
export interface GraphQLExtensions {
  /** `X-Request-Id` of the request if it is a safe string, otherwise a random UUID */
  readonly requestId: string;
  readonly limits?: LimitsUsage;
  /** Time of the whole request, ms */
  readonly queryTime?: number;
  /** Number of this request since the start of the server */
  readonly requestCounter?: number;
  readonly startupTime?: Date;
  readonly diagnostics?: RequestDiagnostics;
  readonly [key: string]: unknown;
}

export type ApplicationFactory = (props: InitProps) => HTTPListener;

export type PersistedQueriesMap = Record<string, string>;

export type Configuration = NonNullable<InitProps>;
