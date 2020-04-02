import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'Money',

  description: 'The value is stored in the smallest monetary unit.',

  serialize(value) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(
        `Value is not an instance of string or number: ${JSON.stringify(value)}`,
      );
    }

    return Number(value);
  },

  parseValue(value) {
    if (typeof value === 'string') {
      throw new TypeError(`Value is not a valid Integer: ${value}`);
    }

    return BigInt(value);
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new GraphQLError(
        `Can only parse strings & integers to money but got a: ${ast.kind}`,
      );
    }

    try {
      const result = BigInt(ast.value);

      return result;
    } catch (err) {
      throw new GraphQLError(`Value is not a valid Money: ${ast.value}`);
    }
  },
});
