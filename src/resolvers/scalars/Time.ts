import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/* eslint-disable no-useless-escape */
const TIME_REGEX = new RegExp(/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/);
/* eslint-enable */

export default new GraphQLScalarType({
  name: 'Time',
  description: 'Time string',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Value is not string: ${value}`);
    }

    if (!TIME_REGEX.test(value)) {
      throw new TypeError(`Value is not a valid time: ${value}`);
    }

    return value.length === 5 ? `${value}:00` : value;
  },

  parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Value is not string');
    }

    if (!TIME_REGEX.test(value)) {
      throw new TypeError(`Value is not a valid time: ${value}`);
    }

    return value.length === 5 ? `${value}:00` : value;
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as time but got a: ${ast.kind}`);
    }

    if (!TIME_REGEX.test(ast.value)) {
      throw new TypeError(`Value is not a valid time: ${ast.value}`);
    }

    return ast.value.length === 5 ? `${ast.value}:00` : ast.value;
  },
});
