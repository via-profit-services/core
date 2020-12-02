import DataLoader from 'dataloader';
import { withFilter } from 'graphql-subscriptions';

import Application from './app';
import resolvers from './schema/resolvers';
import typeDefs from './schema/typeDefs';

export * from './logger';
export * from './errorHandlers';
export * from './utils/cursors';
export * from './utils/nodes';
export * from './utils/filters';

export {
  typeDefs,
  resolvers,
  DataLoader,
  withFilter,
};

export default Application;
