import DataLoader from 'dataloader';
import { withFilter } from 'graphql-subscriptions';

import applicationFactory from './application';
import logFormatter from './logger/log-formatter';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';

export * from './errorHandlers';
export * from './utils/cursors';
export * from './utils/nodes';
export * from './utils/filters';

export {
  resolvers,
  typeDefs,
  DataLoader,
  withFilter,
  logFormatter,
};

export default applicationFactory;
