/* eslint-disable no-console */
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { createServer } from 'http';

import viaProfitServerFactory, { typeDefs, resolvers } from '../index';

const PORT = 9005;
const app = express();
const server = createServer(app);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

app.use(viaProfitServerFactory({
  server,
  schema,
  debug: true,
  enableIntrospection: true,
}));


server.listen(PORT, () => {
  console.log(`GraphQL server started at http://localhost:${PORT}/graphql`);
  console.log(`GraphQL server started at ws://localhost:${PORT}/graphql`);
});
