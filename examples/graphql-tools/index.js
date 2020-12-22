const express = require('express');
const http = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { factory, resolvers, typeDefs } = require('@via-profit-services/core');

const customTypeDefs = /* GraphQL */`
  extend type Query {
    foo: String!
  }
`;

const customResolvers = {
  Query: {
    foo: () => 'The foo',
  },
};

(async () => {

  const port = 9005;
  const app = express();
  const server = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs: [
      typeDefs,
      customTypeDefs,
    ],
    resolvers: [
      resolvers,
      customResolvers,
    ],
  });

  const { graphQLExpress } = await factory({
    introspection: true,
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();