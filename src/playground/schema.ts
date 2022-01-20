import path from 'node:path';
import fs from 'node:fs';
import type { Context, UploadedFile } from '@via-profit-services/core';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLInt,
} from 'graphql';

import {
  buildQueryFilter,
  FileUploadScalarType,
  DateScalarType,
  DateTimeScalarType,
  EmailAddressScalarType,
  MoneyScalarType,
  TimeScalarType,
  VoidScalarType,
  URLScalarType,
  JSONScalarType,
  JSONObjectScalarType,
  BetweenDateInputType,
  BetweenDateTimeInputType,
  BetweenIntInputType,
  BetweenMoneyInputType,
  BetweenTimeInputType,
  ConnectionInterfaceType,
  EdgeInterfaceType,
  ErrorInterfaceType,
  NodeInterfaceType,
} from '../index';

const schema = new GraphQLSchema({
  types: [
    FileUploadScalarType,
    DateScalarType,
    DateTimeScalarType,
    EmailAddressScalarType,
    MoneyScalarType,
    TimeScalarType,
    VoidScalarType,
    URLScalarType,
    JSONScalarType,
    JSONObjectScalarType,
    BetweenDateInputType,
    BetweenDateTimeInputType,
    BetweenIntInputType,
    BetweenMoneyInputType,
    BetweenTimeInputType,
    ConnectionInterfaceType,
    EdgeInterfaceType,
    ErrorInterfaceType,
    NodeInterfaceType,
  ],
  query: new GraphQLObjectType<unknown, Context>({
    name: 'Query',
    fields: () => ({
      test: {
        type: new GraphQLNonNull(JSONScalarType),
        resolve: (_parent, args) => {
          const queryFilter = buildQueryFilter(args);

          return queryFilter;
        },
        args: {
          first: { type: GraphQLInt },
          last: { type: GraphQLInt },
          filter: {
            type: new GraphQLInputObjectType({
              name: 'InputFilter',
              fields: {
                ids: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
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
      uploadFiles: {
        type: new GraphQLNonNull(
          new GraphQLList(
            new GraphQLNonNull(
              new GraphQLObjectType({
                name: 'UploadedFilePayload',
                fields: {
                  location: { type: new GraphQLNonNull(GraphQLString) },
                  mimeType: { type: new GraphQLNonNull(GraphQLString) },
                  size: { type: new GraphQLNonNull(GraphQLInt) },
                },
              }),
            ),
          ),
        ),
        args: {
          filesList: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FileUploadScalarType))),
          },
        },
        resolve: async (_parent, args: { filesList: UploadedFile[] }) => {
          const { filesList } = args;

          const response: { location: string; mimeType: string; size: number }[] = [];
          const filesData = await Promise.all(filesList);
          await filesData.reduce(async (prev, file) => {
            await prev;

            const { createReadStream, mimeType } = file;
            const readStream = createReadStream();
            const location = path.resolve(
              __dirname,
              `../.files/${Date.now()}-` + mimeType.replace('/', '.'),
            );
            fs.mkdirSync(path.dirname(location), {
              recursive: true,
            });

            const writeStream = fs.createWriteStream(location);
            const writeFile = new Promise<void>(resolve => {
              writeStream.on('close', async () => {
                const { size } = fs.statSync(location);
                response.push({
                  location,
                  size,
                  mimeType,
                });
                resolve();
              });

              readStream.pipe(writeStream);
            });

            await writeFile;
          }, Promise.resolve());

          return response;
        },
      },
    },
  }),
});

export default schema;
