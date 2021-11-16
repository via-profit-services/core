import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/* eslint-disable no-useless-escape */
const DATE_REGEX = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);

export default new GraphQLScalarType({
  name: 'Date',
  description: 'Analogue of Date object',

  serialize(value) {
    let v = value;

    if (!(v instanceof Date) && typeof v !== 'string') {
      throw new TypeError(`Value is not an instance of Date, Date string: ${JSON.stringify(v)}`);
    }

    if (typeof v === 'string') {
      v = new Date();
      v.setTime(Date.parse(value));
    }

    // eslint-disable-next-line no-restricted-globals
    if (Number.isNaN(v.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${JSON.stringify(v)}`);
    }

    return [v.getFullYear(), `0${v.getMonth() + 1}`.slice(-2), `0${v.getDate()}`.slice(-2)].join(
      '-',
    );
  },

  parseValue(value) {
    const date = new Date(value);

    if (!DATE_REGEX.test(value)) {
      throw new TypeError(`Value is not a valid date only: ${value}`);
    }

    // eslint-disable-next-line no-restricted-globals
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${value}`);
    }

    return date;
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`);
    }

    if (!DATE_REGEX.test(ast.value)) {
      throw new TypeError(`Value is not a valid date only: ${ast.value}`);
    }

    const result = new Date(ast.value);

    // eslint-disable-next-line no-restricted-globals
    if (Number.isNaN(result.getTime())) {
      throw new GraphQLError(`Value is not a valid Date: ${ast.value}`);
    }

    return result;
  },
});
