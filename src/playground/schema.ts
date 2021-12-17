import type { Context, UploadedFile } from '@via-profit-services/core';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLInt,
} from 'graphql';
import path from 'path';
import fs from 'fs';

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
      upload: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(VoidScalarType))),
        args: {
          filesList: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FileUploadScalarType))),
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
            const filepath = path.resolve(__dirname, `${Date.now()}-` + mimeType.replace('/', '.'));
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

export default schema;
