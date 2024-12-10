import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType<bigint, string>({
  name: 'Money',
  description: `Money type.
The value is stored in the smallest monetary unit (kopecks, cents, etc.)
Real type - String
e.g. For 250 USD this record returns value as "250000" (250$ * 100¢)
`,

  serialize(value) {
    if (typeof value !== 'string' && typeof value !== 'bigint') {
      throw new TypeError(`Value is not an instance of string or bigint: ${JSON.stringify(value)}`);
    }

    return value.toString();
  },

  parseValue(value) {
    if (typeof value === 'string') {
      return BigInt(value);
    }

    throw new TypeError(`Value is not a valid Integer: ${value}`);
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only parse strings to money but got a: ${ast.kind}`, {});
    }

    return BigInt(ast.value);
  },
});
