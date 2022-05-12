import { GraphQLError } from 'graphql';
import type {
  ServerError as ServerErrorInterface,
  ServerErrorType,
} from '@via-profit-services/core';

class ServerError extends Error implements ServerErrorInterface {
  constructor(
    readonly graphqlErrors: readonly GraphQLError[],
    readonly errorType: ServerErrorType,
  ) {
    super();

    Object.defineProperty(this, 'name', { value: 'ServerError' });
  }
}

export default ServerError;
