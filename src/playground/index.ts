/* eslint-disable no-console */
import cors from 'cors';
import express from 'express';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import http from 'http';
import type { Context } from '@via-profit-services/core';

import * as core from '../index';
import { buildQueryFilter } from '../utils/filters';

(async () => {
  // Define schema
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType<unknown, Context>({
      name: 'Query',
      fields: () => ({
        test: {
          type: new GraphQLNonNull(core.resolvers.JSON),
          resolve: (_parent, args) => {
            const queryFilter = buildQueryFilter(args);

            return queryFilter;
          },
          args: {
            filter: {
              type: new GraphQLInputObjectType({
                name: 'InputFilter',
                fields: {
                  ids: {
                    type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
                  },
                },
              }),
            },
          },
        },
      }),
    }),
  });

  // Make the HTTP server with express and initialize the core
  const app = express();
  const server = http.createServer(app);
  const { graphQLExpress } = await core.factory({
    server,
    schema,
  });

  app.use(cors());
  // Apply graphQLExpress as middleware
  // You can use any endpoint other than `/graphql`
  app.use('/graphql', graphQLExpress);

  // Finally start the server
  server.listen(9005, () => {
    // eslint-disable-next-line no-console
    console.info('GraphQL server started at http://localhost:9005/graphql');
  });
})();
