import { GraphQLError } from 'graphql';
import type { ServerErrorType } from './types';

/**
 * Status codes for each errorType when the exact status is not given.
 */
const DEFAULT_STATUS: Record<ServerErrorType, number> = {
  'graphql-error-validate-request': 400,
  'graphql-error-validate-field': 400,
  'graphql-error-execute': 405,
  'graphql-error-validate-schema': 500,
};

class ServerError extends Error {
  readonly httpStatus: number;

  constructor(
    readonly graphqlErrors: readonly GraphQLError[],
    readonly errorType: ServerErrorType,
    httpStatus?: number,
  ) {
    super(graphqlErrors[0]?.message);

    Object.defineProperty(this, 'name', { value: 'ServerError' });
    this.httpStatus = httpStatus ?? DEFAULT_STATUS[errorType];
  }
}

export default ServerError;
