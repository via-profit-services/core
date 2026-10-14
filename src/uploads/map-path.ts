/**
 * Places an upload into `operations` by a path from the multipart `map` field.
 *
 * GraphQL multipart request spec: `map` is `{ "0": ["variables.files.0"] }`,
 * the client sends `null` placeholders in variables, and the server replaces
 * every placeholder with the uploaded file.
 *
 * The path comes from the client, so it is validated strictly:
 *
 * - it must start with `variables.` (batched operations are not supported);
 * - every segment must be an OWN property of the current object.
 *   The `in` operator must not be used here: `'__proto__' in {}` and
 *   `'toString' in {}` are `true` because `in` looks into the prototype chain.
 *   Following such a path lets a client overwrite `Object.prototype` of the
 *   whole Node.js process (prototype pollution);
 * - `__proto__`, `constructor` and `prototype` are rejected explicitly;
 * - array segments must be integer indexes inside the array.
 *
 * Returns an error message or null on success.
 */
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
const INDEX_REGEX = /^(0|[1-9]\d*)$/;

const isContainer = (value: unknown): value is Record<string, unknown> | unknown[] =>
  typeof value === 'object' && value !== null;

export const setUploadByPath = (
  operations: Record<string, unknown>,
  path: string,
  upload: unknown,
): string | null => {
  const segments = path.split('.');

  if (segments.length < 2 || segments[0] !== 'variables') {
    return `Invalid map path «${path}»: it must start with «variables.»`;
  }

  let current: unknown = operations;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;

    if (FORBIDDEN_SEGMENTS.has(segment)) {
      return `Invalid map path «${path}»: segment «${segment}» is not allowed`;
    }

    if (!isContainer(current)) {
      return `Invalid map path «${path}»: «${segment}» does not exist`;
    }

    if (Array.isArray(current)) {
      if (!INDEX_REGEX.test(segment) || Number(segment) >= current.length) {
        return `Invalid map path «${path}»: «${segment}» is not an index of the array`;
      }
    } else if (!Object.prototype.hasOwnProperty.call(current, segment)) {
      return `Invalid map path «${path}»: «${segment}» does not exist`;
    }

    if (isLast) {
      (current as Record<string, unknown>)[segment] = upload;

      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return `Invalid map path «${path}»`;
};
