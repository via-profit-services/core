import { IMiddleware } from 'graphql-middleware';

import { IContext } from '../types';
import UnauthorizedError from '../errorHandlers/UnauthorizedError';
import { ACCESS_TOKEN_EMPTY_ID } from './const';

const graphQLAuthMiddleware: IMiddleware = async (
  resolve: any, parent: any, args: any, context: IContext) => {

  const { token } = context;
  if (!token || token.id === ACCESS_TOKEN_EMPTY_ID) {
    throw new UnauthorizedError('Invalid token');
  }

  return resolve()
}

export default {
  Query: graphQLAuthMiddleware,
  Mutation: graphQLAuthMiddleware,
  Subscription: graphQLAuthMiddleware,
};
