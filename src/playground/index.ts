import express from 'express';
import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import http from 'http';


import * as core from '../index';

(async () => {

  // Define schema
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        version: {
          type: new GraphQLNonNull(GraphQLString),
          resolve: () => 'v0.0.2',
        },
      }),
    }),
  });

  // Make the HTTP server with express and initialize the core
  const app = express();
  const server = http.createServer(app);
  const { graphQLExpress } = await core.factory({
    introspection: process.env.NODE_ENV === 'development',
    server,
    schema,
  });

  // Apply graphQLExpress as middleware
  // You can use any endpoint other than `/graphql`
  app.use('/graphql', graphQLExpress);

  // Finally start the server
  server.listen(9005, () => {
    // eslint-disable-next-line no-console
    console.info('GraphQL server started at http://localhost:9005/graphql');
  });

})();