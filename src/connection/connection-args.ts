import { GraphQLError } from 'graphql';

import { invalidCursorError } from './cursor-codec';
import type {
  ConnectionArgs,
  ConnectionCursor,
  ConnectionPayload,
  ParseConnectionArgsOptions,
} from './types';

const argsError = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

const isSet = <T>(value: T | null | undefined): value is T =>
  value !== null && typeof value !== 'undefined';

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/**
 * The filters are stored in the cursor as JSON, so the first page must see
 * them the same way the next pages will: dates as strings, no undefined keys
 */
const toJSON = <T>(value: T) => JSON.parse(JSON.stringify(value ?? {}));

/**
 * Checks the arguments of a connection field and turns them into
 * `limit` / `offset` for the database query and the cursor of the page.
 *
 * The cursor keeps the filters of the first page, so the next page can be
 * requested with `after` / `before` only. Filters passed explicitly (not
 * undefined) win over the cursor ones: restrictions added by the server
 * (e.g. `client: [<own client>]`) must never be replaced by a cursor.
 *
 * Supported forms:
 * - `first`                     - the first page
 * - `first` + `after`           - the page after the cursor
 * - `last` + `before`           - the page before the cursor
 * - `first` + `offset`          - page navigation by number, without cursors
 *
 * `last` without `before` (the last N records of the whole list) needs the
 * total count, which is not known before the query: it is rejected.
 *
 * Errors are GraphQLError with code BAD_USER_INPUT.
 *
 * @param filters - filters of the current request; explicit (not undefined)
 * values win over the values from the cursor
 */
const parseConnectionArgs = <Filters extends object>(
  args: ConnectionArgs,
  filters: Filters,
  options: ParseConnectionArgsOptions,
): ConnectionPayload<Filters> => {
  const { first, last, after, before, offset: pageOffset } = args;
  const { codec, maxPageSize } = options;

  if (isSet(first) === isSet(last)) {
    throw argsError(
      isSet(first)
        ? 'Got «first» and «last» arguments. Provide only one of them'
        : 'Missing «first» or «last» argument. Provide one of them',
    );
  }

  if (isSet(after) && isSet(before)) {
    throw argsError('Got «after» and «before» arguments. Provide only one of them');
  }

  const size = isSet(first) ? first : last;
  const sizeName = isSet(first) ? 'first' : 'last';

  if (!isCount(size)) {
    throw argsError(`Argument «${sizeName}» must be a non-negative integer`);
  }

  if (typeof maxPageSize === 'number' && size > maxPageSize) {
    throw argsError(`Argument «${sizeName}» must not exceed ${maxPageSize}`);
  }

  if (isSet(first) && isSet(before)) {
    throw argsError('Argument «before» is used with «last», «first» is used with «after»');
  }

  if (isSet(last) && !isSet(before)) {
    throw argsError(
      isSet(after)
        ? 'Argument «after» is used with «first», «last» is used with «before»'
        : 'Missing «before» argument: «last» returns the records before the cursor',
    );
  }

  // Page navigation by number: the cursor is not used
  if (isSet(pageOffset)) {
    if (!isSet(first) || isSet(after)) {
      throw argsError('Argument «offset» can be used with the «first» argument only, without «after»');
    }

    if (!isCount(pageOffset)) {
      throw argsError('Argument «offset» must be a non-negative integer');
    }

    return {
      limit: size,
      offset: pageOffset,
      cursor: { ...toJSON(filters), offset: pageOffset },
    };
  }

  const cursorValue = isSet(after) ? after : before;

  if (!isSet(cursorValue)) {
    return { limit: size, offset: 0, cursor: { ...toJSON(filters), offset: 0 } };
  }

  const payload = codec.decode<Record<string, unknown>>(cursorValue);
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    !isCount(payload.offset)
  ) {
    throw invalidCursorError();
  }

  // The offset of the cursor is the position of its record in the whole list
  const position = payload.offset;
  const explicitFilters = Object.fromEntries(
    Object.entries(toJSON(filters)).filter(([key]) => key !== 'offset'),
  );
  const merged = { ...payload, ...explicitFilters };

  if (isSet(after)) {
    const offset = position + 1;

    return { limit: size, offset, cursor: { ...merged, offset } as ConnectionCursor<Filters> };
  }

  // `before`: records [position - last, position), the cursor record itself is excluded
  const offset = Math.max(position - size, 0);

  return {
    limit: position - offset,
    offset,
    cursor: { ...merged, offset } as ConnectionCursor<Filters>,
  };
};

export default parseConnectionArgs;
