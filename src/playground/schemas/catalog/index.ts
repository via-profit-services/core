import { makeExecutableSchema } from 'graphql-tools';
import configureCatalogLogger from './logger';
import resolvers from './resolvers';
import * as typeDefs from './schema.graphql';

export { configureCatalogLogger };

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
