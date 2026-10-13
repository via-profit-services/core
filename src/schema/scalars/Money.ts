import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/**
 * An integer written in decimal digits with an optional minus sign.
 * `BigInt()` alone is not enough: it accepts `""` (→ 0n), `" 12 "`,
 * `"0x1F"`, `"0b101"` and `"0o7"`.
 */
const INTEGER_REGEX = /^-?\d{1,30}$/;

const parseMoney = (value: string): bigint => {
  if (!INTEGER_REGEX.test(value)) {
    throw new TypeError(`Value is not a valid Integer: ${value}`);
  }

  return BigInt(value);
};

/**
 * GraphQL `Money` scalar.
 *
 * Represents monetary values stored in the smallest currency unit
 * (cents, kopecks, etc.) using a bigint internally.
 *
 * Why bigint?
 * - Avoids floating‑point rounding issues.
 * - Safe for large monetary values.
 *
 * Input:
 * - Must be a string containing a decimal integer (e.g. "250000", "-100").
 * - Parsed into a bigint.
 *
 * Output:
 * - Always serialized as a string.
 *
 * Examples:
 * - 250 USD → "25000" (250 * 100 cents)
 * - 1999 RUB → "199900" (1999 * 100 kopecks)
 */
export default new GraphQLScalarType<bigint, string>({
  name: 'Money',
  description: `Money type.
The value is stored in the smallest monetary unit (kopecks, cents, etc.)
Real type - String.
Example: 250 USD → "25000" (250 * 100¢)
`,

  /**
   * Serializes internal value (bigint, integer string or safe integer) to a string.
   */
  serialize(value) {
    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return String(value);
    }

    if (typeof value === 'string') {
      return parseMoney(value).toString();
    }

    throw new TypeError(`Money cannot represent value: ${JSON.stringify(value)}`);
  },

  /**
   * Parses incoming variable values. Only strings are accepted.
   */
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Value is not a valid Integer: ${value}`);
    }

    return parseMoney(value);
  },

  /**
   * Parses literal values in GraphQL queries.
   *   mutation { pay(amount: "25000") }  // ok
   *   mutation { pay(amount: 25000) }    // not allowed
   */
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only parse strings to Money but got: ${ast.kind}`, {
        nodes: [ast],
      });
    }

    try {
      return parseMoney(ast.value);
    } catch {
      throw new GraphQLError(`Invalid Money literal: ${ast.value}`, { nodes: [ast] });
    }
  },
});
