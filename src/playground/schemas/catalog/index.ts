import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schema.graphql';
import resolvers from './resolvers';
import configureCatalogLogger from './logger';

export { configureCatalogLogger };

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
