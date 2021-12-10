/* eslint-disable no-console */
import cors from 'cors';
import express from 'express';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
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
    types: [
      // scalars
      core.DateScalarType,
      core.DateTimeScalarType,
      core.EmailAddressScalarType,
      core.MoneyScalarType,
      core.TimeScalarType,
      core.VoidScalarType,
      core.URLScalarType,
      core.JSONScalarType,
      core.JSONObjectScalarType,
      // inputs
      core.BetweenDateInputType,
      core.BetweenDateTimeInputType,
      core.BetweenIntInputType,
      core.BetweenMoneyInputType,
      core.BetweenTimeInputType,
      // interfaces
      core.ConnectionInterfaceType,
      core.EdgeInterfaceType,
      core.ErrorInterfaceType,
      core.NodeInterfaceType,
    ],
    query: new GraphQLObjectType<unknown, Context>({
      name: 'Query',
      fields: () => ({
        test: {
          type: new GraphQLNonNull(core.JSONScalarType),
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
    middleware: ({ context, requestCounter }) => {
      if (requestCounter === 1) {
        context.emitter.on('graphql-error', console.error);
      }

      return { context };
    },
  });

  app.use(cors());
  // Apply graphQLExpress as middleware
  // You can use any endpoint other than `/graphql`
  app.use('/graphql', graphQLExpress);

  // Finally start the server
  server.listen(8080, () => {
    // eslint-disable-next-line no-console
    console.info('GraphQL server started at http://localhost:8080/graphql');
  });
})();
