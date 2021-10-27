/* eslint-disable no-console */
import type { Context } from '@via-profit-services/core';
import { GraphQLError } from 'graphql';

interface Props {
  error: GraphQLError;
  context: Context;
  debug: boolean;
}

const customFormatErrorFn = (props: Props) => {
  const { error, context, debug } = props;
  const { emitter } = context;

  const { originalError } = error;
  const stack = error.stack.split('\n') || [];

  emitter.emit(
    'graphql-error',
    typeof originalError?.message === 'string' ? originalError.message : error?.message,
    {
      stack,
      error,
    },
  );

  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
    stack: debug && error.stack ? error.stack.split('\n') : [],
  };
};

export default customFormatErrorFn;
