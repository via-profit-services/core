import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

// ISO-8601 строго в UTC
const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError(`Invalid Date object: ${value}`);
    }
    return value;
  }

  // ISO-UTC only
  if (typeof value === 'string') {
    if (!ISO_UTC_REGEX.test(value)) {
      throw new TypeError(`Date string must be ISO-UTC (YYYY-MM-DDTHH:mm:ss.sssZ): ${value}`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Invalid ISO-UTC date: ${value}`);
    }
    return date;
  }

  // timestamp in milliseconds
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Date number must be finite: ${value}`);
    }

    // Проверка: timestamp должен быть в миллисекундах
    if (value < 1e12) {
      throw new TypeError(`Invalid timestamp: ${value}. Expected milliseconds.`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Invalid timestamp: ${value}`);
    }

    return date;
  }


  throw new TypeError(`Value must be Date, ISO-UTC string, or timestamp: ${JSON.stringify(value)}`);
}

export default new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  description:
    'DateTime ISO-UTC',

  serialize(value) {
    const date = parseDate(value);
    return date.toISOString(); // always UTC
  },

  parseValue(value) {
    return parseDate(value);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseDate(ast.value);
    }

    if (ast.kind === Kind.INT) {
      return parseDate(Number(ast.value));
    }

    throw new GraphQLError(`DateTime must be a string or integer, got: ${ast.kind}`);
  },
});
