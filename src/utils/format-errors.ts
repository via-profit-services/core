import type { Context, ServerErrorType } from '@via-profit-services/core';
import { GraphQLFormattedError, GraphQLError } from 'graphql';
import ServerError from '../server-error';

type FormatErrors = (props: {
  error: unknown;
  debug?: boolean;
  context: Context;
}) => readonly GraphQLFormattedError[];

const formatErrors: FormatErrors = ({ error, debug, context }) => {
  const errorsList: GraphQLFormattedError[] = [];
  const { emitter } = context;

  if (error instanceof ServerError && Array.isArray(error.graphqlErrors)) {
    const { graphqlErrors, errorType } = error as {
      graphqlErrors: readonly GraphQLError[];
      errorType: ServerErrorType;
    };

    graphqlErrors.forEach(graphqlError => {
      const stacktrace =
        debug && typeof graphqlError.stack === 'string'
          ? graphqlError.stack.split('\n')
          : undefined;

      errorsList.push({
        ...graphqlError.toJSON(),
        extensions: {
          errorType,
          stacktrace,
        },
      });
    });

    switch (errorType) {
      case 'graphql-error-execute':
        emitter.emit('graphql-error-execute', graphqlErrors);
        break;
      case 'graphql-error-validate-field':
        emitter.emit('graphql-error-validate-field', graphqlErrors);
        break;
      case 'graphql-error-validate-request':
        emitter.emit('graphql-error-validate-request', graphqlErrors);
        break;
      case 'graphql-error-validate-schema':
        emitter.emit('graphql-error-validate-schema', graphqlErrors);
        break;
      default:
        break;
    }

    return errorsList;
  }

  if (error instanceof Error) {
    const extensions: GraphQLFormattedError['extensions'] = {};
    if (debug && typeof error.stack === 'string') {
      extensions.stacktrace = error.stack.split('\n') || [];
    }

    errorsList.push({
      message: error.message,
      extensions: Object.entries(extensions).length ? extensions : undefined,
    });

    emitter.emit('graphql-error-execute', [new GraphQLError(error.message, {})]);

    return errorsList;
  }

  return errorsList;
};

export default formatErrors;
