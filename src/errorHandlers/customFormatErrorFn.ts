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

  // if (debug) {
  //   console.log('');
  //   console.log(
  //     '\x1b[31m%s\x1b[0m',
  //     `Caught the ${originalError?.name ?? originalError?.name ?? error.name} «${
  //       originalError?.message ?? originalError ?? error.message
  //     }»`,
  //   );
  //   console.log('');
  //   console.log('\x1b[33m%s\x1b[0m', `Call stack: ${error.stack}`);
  //   console.log('');
  // }
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
