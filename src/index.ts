import DataLoader from 'dataloader';
import { withFilter } from 'graphql-subscriptions';
import Winston from 'winston';
import 'winston-daily-rotate-file';

import Application from './app';
import logFormatter from './logger/log-formatter';
import resolvers from './schema/resolvers';
import typeDefs from './schema/typeDefs';


export * from './errorHandlers';
export * from './utils/cursors';
export * from './utils/nodes';
export * from './utils/filters';

export {
  typeDefs,
  resolvers,
  DataLoader,
  withFilter,
  logFormatter,
  Winston,
};

export default Application;
