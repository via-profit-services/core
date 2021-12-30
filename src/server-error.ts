import { GraphQLError } from 'graphql';

class ServerError extends Error {
  constructor(readonly graphqlErrors: readonly GraphQLError[], readonly errorType: string) {
    super();

    Object.defineProperty(this, 'name', { value: 'ServerError' });
  }
}

export default ServerError;
