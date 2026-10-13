import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/**
 * ISO 8601 date or date-time:
 *   2026-03-05
 *   2026-03-05T10:15
 *   2026-03-05T10:15:20.123456      (Dart DateTime.toIso8601String() of a local date)
 *   2026-03-05T10:15:20.123Z
 *   2026-03-05T10:15:20+05:00
 * A space instead of "T" is accepted too (RFC 3339).
 */
const ISO_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?)?(Z|[+-]\d{2}:?\d{2})?$/i;

/**
 * Timestamps below this absolute value are most likely seconds, not
 * milliseconds: 1e11 ms is 1973-03-03, while 1e11 seconds is year 5138.
 * Passing seconds instead of milliseconds is a common client bug that would
 * silently turn a date into January 1970.
 */
const MIN_MILLISECONDS_TIMESTAMP = 1e11;

/**
 * Input values (variables and literals).
 *
 * Only ISO 8601 strings are accepted: `new Date()` alone accepts almost
 * anything (`new Date('1')` is 2001-01-01) and silently moves impossible
 * dates (`2026-02-30` becomes March 2).
 *
 * A string WITHOUT a time zone is accepted for compatibility with existing
 * clients (mobile apps send `DateTime.now().toIso8601String()`). JavaScript
 * interprets such a date-time in the time zone of the SERVER, and a
 * date-only string (`2026-03-05`) as UTC midnight. Clients should send UTC
 * (`...Z`) or an explicit offset.
 */
const parseInput = (value: unknown): Date => {
  if (typeof value === 'string') {
    const match = ISO_REGEX.exec(value);
    if (!match) {
      throw new TypeError(`Date string must be ISO 8601, e.g. 2026-03-05T10:15:20.000Z: ${value}`);
    }

    const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = match;
    const calendarDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const isRealDay =
      calendarDay.getUTCFullYear() === Number(year) &&
      calendarDay.getUTCMonth() === Number(month) - 1 &&
      calendarDay.getUTCDate() === Number(day);

    const date = new Date(value);
    if (
      !isRealDay ||
      Number(hours) > 23 ||
      Number(minutes) > 59 ||
      Number(seconds) > 59 ||
      Number.isNaN(date.getTime())
    ) {
      throw new TypeError(`Invalid ISO date: ${value}`);
    }

    return date;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Math.abs(value) < MIN_MILLISECONDS_TIMESTAMP) {
      throw new TypeError(`Invalid timestamp: ${value}. Expected milliseconds.`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Invalid timestamp: ${value}`);
    }

    return date;
  }

  throw new TypeError(`DateTime must be an ISO 8601 string or a timestamp in milliseconds`);
};

/**
 * Output values come from our own resolvers (often straight from a
 * database), so any valid Date, date string or millisecond timestamp is
 * accepted and converted to ISO-UTC.
 */
const parseOutput = (value: unknown): Date => {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    throw new TypeError(`DateTime cannot represent value: ${JSON.stringify(value)}`);
  }

  return date;
};

export default new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  description: 'Date and time in ISO 8601. Output is always UTC, e.g. `2026-03-05T10:15:20.000Z`',

  serialize(value) {
    return parseOutput(value).toISOString();
  },

  parseValue(value) {
    return parseInput(value);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseInput(ast.value);
    }

    if (ast.kind === Kind.INT) {
      return parseInput(Number(ast.value));
    }

    throw new GraphQLError(`DateTime must be a string or integer, got: ${ast.kind}`, {
      nodes: ast,
    });
  },
});
