import { GraphQLScalarType, GraphQLError, Kind, print } from 'graphql';

/**
 * Decimal integer. The length is limited: converting a huge string to
 * BigInt costs CPU and nobody needs numbers with thousands of digits.
 */
const INTEGER_REGEX = /^-?\d{1,100}$/;

const parseBigInt = (value: unknown): bigint => {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new GraphQLError(`BigInt cannot represent non-integer or unsafe number: ${value}`);
    }

    return BigInt(value);
  }

  if (typeof value === 'string' && INTEGER_REGEX.test(value)) {
    return BigInt(value);
  }

  throw new GraphQLError(`BigInt cannot represent value: ${String(value).slice(0, 100)}`);
};

export default new GraphQLScalarType<bigint, string | number>({
  name: 'BigInt',
  description: 'The `BigInt` scalar type represents non-fractional signed whole numeric values',
  serialize(value) {
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      typeof value !== 'bigint'
    ) {
      throw new TypeError(
        `Value is not an instance of string, number, boolean or bigint: ${JSON.stringify(value)}`,
      );
    }

    const bigint = typeof value === 'boolean' ? BigInt(value) : parseBigInt(value);

    // Safe integers are returned as numbers, larger values as strings (JSON has no bigint)
    if (bigint >= Number.MIN_SAFE_INTEGER && bigint <= Number.MAX_SAFE_INTEGER) {
      return Number(bigint);
    }

    return bigint.toString();
  },
  parseValue(value) {
    return parseBigInt(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT && ast.kind !== Kind.STRING) {
      throw new GraphQLError(`BigInt cannot represent non-integer value: ${print(ast)}`, {
        nodes: ast,
      });
    }

    try {
      return parseBigInt(ast.value);
    } catch (err) {
      throw new GraphQLError((err as Error).message, { nodes: ast });
    }
  },
});
