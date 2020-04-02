import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'AccountRole',

  description: 'Account Role name',

  serialize(value) {
    if (typeof value !== 'string') {
      throw new TypeError(
        `Value is not an instance of string: ${JSON.stringify(value)}`,
      );
    }

    return String(value);
  },

  parseValue(value) {
    return String(value);
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only parse strings to role but got a: ${ast.kind}`,
      );
    }

    return String(ast);
  },
});
