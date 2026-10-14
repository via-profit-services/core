/**
 * A non-null object that is not an array (e.g. a parsed JSON object)
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
