import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType<null | void, null | void>({
  name: 'Void',
  description: 'Represents NULL values',
  serialize() {
    return null;
  },

  parseValue() {
    return null;
  },

  parseLiteral() {
    return null;
  },
});
