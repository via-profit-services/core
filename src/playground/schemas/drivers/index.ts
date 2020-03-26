import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import * as typeDefs from './schema.graphql';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
export { schema };
export * from './events';
