import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

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
 * - Must be a string containing an integer (e.g. "250000").
 * - Parsed into a bigint.
 *
 * Output:
 * - Always serialized as a string.
 *
 * Examples:
 * - 250 USD → "25000" (250 * 100 cents)
 * - 1999 RUB → "199900" (1999 * 100 kopecks)
 *
 * Notes for developers:
 * - This scalar does NOT accept float values.
 * - This scalar does NOT accept literal integers (e.g. 123).
 * - Only string literals are allowed in GraphQL queries.
 * - Use bigint internally for all monetary calculations.
 */
export default new GraphQLScalarType<bigint, string>({
  name: 'Money',
  description: `Money type.
The value is stored in the smallest monetary unit (kopecks, cents, etc.)
Real type - String.
Example: 250 USD → "25000" (250 * 100¢)
`,

  /**
   * Serializes internal value (bigint or string) to a string.
   *
   * This is used when returning values from resolvers.
   */
  serialize(value) {
    if (typeof value !== 'string' && typeof value !== 'bigint') {
      throw new TypeError(
        `Value is not an instance of string or bigint: ${JSON.stringify(value)}`,
      );
    }

    return value.toString();
  },

  /**
   * Parses incoming variable values.
   *
   * GraphQL variables always pass through this method.
   * Only string values are accepted.
   */
  parseValue(value) {
    if (typeof value === 'string') {
      try {
        return BigInt(value);
      } catch {
        throw new TypeError(`Value is not a valid Integer: ${value}`);
      }
    }

    throw new TypeError(`Value is not a valid Integer: ${value}`);
  },

  /**
   * Parses literal values in GraphQL queries.
   *
   * Example of supported usage:
   *   mutation { pay(amount: "25000") }
   *
   * Example of unsupported usage:
   *   mutation { pay(amount: 25000) }  // ❌ not allowed
   */
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only parse strings to Money but got: ${ast.kind}`,
        { nodes: [ast] },
      );
    }

    try {
      return BigInt(ast.value);
    } catch {
      throw new GraphQLError(`Invalid Money literal: ${ast.value}`, {
        nodes: [ast],
      });
    }
  },
});
