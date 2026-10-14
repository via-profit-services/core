/**
 * Sizes measured while reading the body, attached to the parsed body as a
 * non-enumerable property: the body object itself stays a plain
 * `{ query, variables, operationName }` for the code that reads it.
 */
export const BODY_STATS = Symbol('@via-profit-services/core/body-stats');

export type BodyStats = {
  /** JSON body: bytes received on the wire (compressed, if it was compressed) */
  readonly bodySize?: number;
  /** multipart: number of files */
  readonly files?: number;
  /** multipart: total size of the files, bytes */
  readonly filesTotalSize?: number;
};

export const setBodyStats = (body: object, stats: BodyStats) => {
  Object.defineProperty(body, BODY_STATS, { value: stats, enumerable: false });
};

export const getBodyStats = (body: unknown): BodyStats | undefined =>
  body && typeof body === 'object'
    ? ((body as Record<symbol, BodyStats | undefined>)[BODY_STATS] ?? undefined)
    : undefined;
