import { GraphQLScalarType, GraphQLError, print } from 'graphql';

export default new GraphQLScalarType({
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

    const bigint = BigInt(value);

    if (bigint >= Number.MIN_SAFE_INTEGER && bigint <= Number.MAX_SAFE_INTEGER) {
      return Number(bigint);
    }

    return bigint.toString();
  },
  parseValue(value) {
    const bigint = BigInt(value.toString());

    if (value.toString() !== bigint.toString()) {
      throw new GraphQLError(`BigInt cannot represent value: ${value}`);
    }

    return bigint;
  },
  parseLiteral(ast) {
    if (!('value' in ast)) {
      throw new GraphQLError(`BigInt cannot represent non-integer value: ${print(ast)}`, {
        nodes: ast,
      });
    }

    const bigint = BigInt(ast.value);

    if (ast.value.toString() !== bigint.toString()) {
      throw new GraphQLError(`BigInt cannot represent value: ${ast.value}`);
    }

    return bigint;
  },
});
