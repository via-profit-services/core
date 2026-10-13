import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/**
 * `H:MM`, `HH:MM`, `HH:MM:SS` from 00:00 to 23:59:59, plus `24:00` / `24:00:00`
 * as the end of a day (useful for intervals like 09:00–24:00).
 */
const TIME_REGEX = /^(?:([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?|(24):(00)(?::(00))?)$/;

/**
 * Always returns `HH:MM:SS`: `9:05` → `09:05:00`.
 */
const normalizeTime = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new TypeError(`Value is not string: ${value}`);
  }

  const match = TIME_REGEX.exec(value);
  if (!match) {
    throw new TypeError(`Value is not a valid time: ${value}`);
  }

  const hours = match[1] ?? match[4];
  const minutes = match[2] ?? match[5];
  const seconds = match[3] ?? match[6] ?? '00';

  return `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
};

export default new GraphQLScalarType({
  name: 'Time',
  description: 'Time string in format HH:MM:SS (input also accepts H:MM and HH:MM)',

  serialize: normalizeTime,
  parseValue: normalizeTime,

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as time but got a: ${ast.kind}`, {
        nodes: ast,
      });
    }

    return normalizeTime(ast.value);
  },
});
