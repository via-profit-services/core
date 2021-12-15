/* eslint-disable no-console */
// import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import http from 'http';
import type { Context, UploadedFile } from '@via-profit-services/core';

import * as core from '../index';
import { buildQueryFilter } from '../utils/filters';

(async () => {
  // Define schema
  const schema = new GraphQLSchema({
    types: [
      // scalars
      core.FileUploadScalarType,
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
    mutation: new GraphQLObjectType<unknown, Context>({
      name: 'Mutation',
      fields: {
        upload: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(core.VoidScalarType))),
          args: {
            filesList: {
              type: new GraphQLNonNull(
                new GraphQLList(new GraphQLNonNull(core.FileUploadScalarType)),
              ),
            },
          },
          resolve: async (_parent, args: { filesList: UploadedFile[] }) => {
            const { filesList } = args;

            const responseData: any[] = [];
            const filesData = await Promise.all(filesList);
            await filesData.reduce(async (prev, file) => {
              await prev;

              const { createReadStream, mimeType } = file;
              const readStream = createReadStream();
              const filepath = path.resolve(__dirname, mimeType.replace('/', '.'));
              const writeStream = fs.createWriteStream(filepath);

              const writeFile = new Promise<void>(resolve => {
                writeStream.on('close', async () => {
                  resolve();
                });

                readStream.pipe(writeStream);
              });

              await writeFile;
            }, Promise.resolve());

            return responseData;
          },
        },
      },
    }),
  });

  // Make the HTTP server with express and initialize the core
  // const app = express();
  const server = http.createServer();
  const graphQLListener = await core.factory({
    server,
    schema,
    middleware: ({ context, requestCounter }) => {
      if (requestCounter === 1) {
        context.emitter.on('graphql-error', console.error);
      }

      return { context };
    },
  });

  server.on('request', (req, res) => {
    switch (req.url) {
      case '/graphql':
        res.statusCode = 200;

        return graphQLListener(req, res);

      default:
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.write('<h1>404 Not found</h1>');
        break;
    }

    return res.end();
  });
  // app.use(cors());
  // Apply graphQLRequestListener as middleware
  // You can use any endpoint other than `/graphql`
  // app.use('/graphql', graphQLRequestListener);

  // Finally start the server
  server.listen(8080, () => {
    // eslint-disable-next-line no-console
    console.info('GraphQL server started at http://localhost:8080/graphql');
  });
})();
