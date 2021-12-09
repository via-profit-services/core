import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'DateTime',
  description: 'Analogue of Date object',

  serialize(value) {
    if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(
        `Value is not an instance of Date, Date string or number: ${JSON.stringify(value)}`,
      );
    }

    if (typeof value === 'string') {
      const date = new Date();
      date.setTime(Date.parse(value));
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Value is not a valid Date: ${JSON.stringify(date)}`);
      }

      return date.toJSON();
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Value is not a valid Date: ${JSON.stringify(date)}`);
      }

      return date.toJSON();
    }

    if (Number.isNaN(value.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${JSON.stringify(value)}`);
    }

    return value.toJSON();
  },

  parseValue(value) {
    if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(
        `Value is not an instance of Date, Date string or number: ${JSON.stringify(value)}`,
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${value}`);
    }

    return date;
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new GraphQLError(`Can only parse strings & integers to dates but got a: ${ast.kind}`);
    }

    const result = new Date(ast.kind === Kind.INT ? Number(ast.value) : ast.value);

    // eslint-disable-next-line no-restricted-globals
    if (Number.isNaN(result.getTime())) {
      throw new GraphQLError(`Value is not a valid Date: ${ast.value}`);
    }

    return result;
  },
});
