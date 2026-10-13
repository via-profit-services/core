import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/**
 * ISO-8601 strictly in UTC: `2026-03-05T10:15:20Z` or `2026-03-05T10:15:20.123Z`
 */
const ISO_UTC_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;

/**
 * Timestamps below this absolute value are most likely seconds, not
 * milliseconds: 1e11 ms is 1973-03-03, while 1e11 seconds is year 5138.
 * Passing seconds instead of milliseconds is a common client bug that would
 * silently turn a date into January 1970.
 */
const MIN_MILLISECONDS_TIMESTAMP = 1e11;

/**
 * Input values (variables and literals) are validated strictly: a string
 * without a time zone is ambiguous (local time of whom?), and `new Date()`
 * accepts almost anything (`new Date('1')` is 2001-01-01 in the local zone).
 */
const parseInput = (value: unknown): Date => {
  if (typeof value === 'string') {
    const match = ISO_UTC_REGEX.exec(value);
    if (!match) {
      throw new TypeError(`Date string must be ISO-UTC (YYYY-MM-DDTHH:mm:ss.sssZ): ${value}`);
    }

    const date = new Date(value);
    const [, year, month, day, hours, minutes, seconds] = match.map(Number);

    // new Date() silently normalizes impossible dates: 2026-02-30 → 2026-03-02
    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hours ||
      date.getUTCMinutes() !== minutes ||
      date.getUTCSeconds() !== seconds
    ) {
      throw new TypeError(`Invalid ISO-UTC date: ${value}`);
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

  throw new TypeError(`DateTime must be an ISO-UTC string or a timestamp in milliseconds`);
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
  description: 'Date and time in ISO-8601 UTC format, e.g. `2026-03-05T10:15:20.000Z`',

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

    throw new GraphQLError(`DateTime must be a string or integer, got: ${ast.kind}`, { nodes: ast });
  },
});
