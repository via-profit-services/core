import { GraphQLError } from 'graphql';

import ServerError from '../errors/server-error';
import { HttpError, isValidHttpStatus } from '../errors/http-error';

/**
 * Well-known error codes and their HTTP status codes
 */
const STATUS_BY_ERROR_CODE: Record<string, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  BAD_USER_INPUT: 400,
};

/**
 * Wraps an error of request parsing into a ServerError: such errors are
 * produced by the core, they are safe to show and must not be masked.
 */
export const asRequestError = (error: unknown): never => {
  if (error instanceof ServerError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const graphqlError = new GraphQLError(message, {
    originalError: error instanceof Error ? error : undefined,
  });

  throw new ServerError(
    [graphqlError],
    'graphql-error-validate-request',
    error instanceof HttpError ? error.status : 400,
  );
};

/**
 * HTTP status code for an error that stopped the request before or instead
 * of execution.
 */
export const statusOfError = (error: unknown): number => {
  if (error instanceof ServerError) {
    return error.httpStatus;
  }

  if (error instanceof GraphQLError) {
    // thrown on purpose (e.g. by a middleware): it may set its own status
    const http = error.extensions?.http as { status?: unknown } | undefined;
    if (isValidHttpStatus(http?.status)) {
      return http.status;
    }

    const code = error.extensions?.code;

    // hasOwnProperty, not `in`: 'toString' in {} is true
    return typeof code === 'string' &&
      Object.prototype.hasOwnProperty.call(STATUS_BY_ERROR_CODE, code)
      ? STATUS_BY_ERROR_CODE[code]
      : 400;
  }

  if (error instanceof HttpError) {
    return error.status;
  }

  // anything else is unexpected: a bug or a failure of an external service
  return 500;
};
