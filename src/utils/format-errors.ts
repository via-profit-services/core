import { GraphQLFormattedError, GraphQLError } from 'graphql';
import ServerError from '../server-error';

const formatErrors = (error: unknown, debug?: boolean): GraphQLFormattedError[] => {
  const errors: GraphQLFormattedError[] = [];

  if (error instanceof ServerError && Array.isArray(error.graphqlErrors)) {
    const { graphqlErrors, errorType } = error as {
      graphqlErrors: readonly GraphQLError[];
      errorType: string;
    };
    graphqlErrors.forEach(graphqlError => {
      errors.push({
        ...graphqlError,
        extensions: {
          errorType,
        },
      });
    });

    return errors;
  }

  if (error instanceof Error) {
    const extensions: GraphQLFormattedError['extensions'] = {};
    if (debug && typeof error.stack === 'string') {
      extensions.stacktrace = error.stack.split('\n') || [];
    }

    errors.push({
      message: error.message,
      extensions: Object.entries(extensions).length ? extensions : undefined,
    });

    return errors;
  }

  return errors;
};

export default formatErrors;
