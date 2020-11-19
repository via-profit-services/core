import { IMiddleware } from 'graphql-middleware';

import { IContext } from '../types';

const graphQLAccessMiddleware: IMiddleware = async (
  resolve: any, parent: any, args: any, context: IContext) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token } = context;

  return resolve()
}

export default {
  Query: graphQLAccessMiddleware,
  Mutation: graphQLAccessMiddleware,
  Subscription: graphQLAccessMiddleware,
};
