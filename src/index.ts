import DefaultResolvers from './schema/resolvers/DefaultResolvers';
import Date from './schema/scalars/Date';
import DateTime from './schema/scalars/DateTime';
import EmailAddress from './schema/scalars/EmailAddress';
import { JSON, JSONObject } from './schema/scalars/JSON';
import Money from './schema/scalars/Money';
import Time from './schema/scalars/Time';
import URL from './schema/scalars/URL';
import schema from './schema/typeDefs';

const scalars = {
  Date,
  DateTime,
  EmailAddress,
  Money,
  Time,
  URL,
  JSON,
  JSONObject,
};

const resolvers = {
  ...scalars,
  ...DefaultResolvers,
}

export * from './types';
export * from './app';
export * from './utils';
export * from './logger';
export * from './errorHandlers';
export { schema, resolvers, scalars };
