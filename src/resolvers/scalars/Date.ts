import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/* eslint-disable no-useless-escape */
const DATE_REGEX = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);

const timeCompose = (value: Date) =>
  [value.getFullYear(), `0${value.getMonth() + 1}`.slice(-2), `0${value.getDate()}`.slice(-2)].join(
    '-',
  );

export default new GraphQLScalarType({
  name: 'Date',
  description: 'Analogue of Date object',

  serialize(value) {
    if (!(value instanceof Date) && typeof value !== 'string') {
      throw new TypeError(
        `Value is not an instance of Date, Date string: ${JSON.stringify(value)}`,
      );
    }

    if (typeof value === 'string') {
      const date = new Date();
      date.setTime(Date.parse(value));
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Value is not a valid Date: ${JSON.stringify(date)}`);
      }

      return timeCompose(date);
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Value is not a valid Date: ${JSON.stringify(date)}`);
      }

      return timeCompose(date);
    }

    if (Number.isNaN(value.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${JSON.stringify(value)}`);
    }

    return timeCompose(value);
  },

  parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Value is not a valid String: ${JSON.stringify(value)}`);
    }

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
      throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`, {});
    }

    if (!DATE_REGEX.test(ast.value)) {
      throw new TypeError(`Value is not a valid date only: ${ast.value}`);
    }

    const result = new Date(ast.value);

    // eslint-disable-next-line no-restricted-globals
    if (Number.isNaN(result.getTime())) {
      throw new GraphQLError(`Value is not a valid Date: ${ast.value}`, {});
    }

    return result;
  },
});
