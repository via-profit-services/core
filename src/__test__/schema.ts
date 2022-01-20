import path from 'node:path';
import fs from 'node:fs';
import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import type { UploadedFile } from '@via-profit-services/core';
import { FileUploadScalarType } from '../index';

const UploadedFilePayload = new GraphQLObjectType({
  name: 'UploadedFilePayload',
  fields: {
    location: { type: new GraphQLNonNull(GraphQLString) },
    mimeType: { type: new GraphQLNonNull(GraphQLString) },
    size: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getFourAsString: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => 'four',
    },
    getFourAsNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: () => 4,
    },
    getFiveWithError: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: () => null, // will be error
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutaation',
  fields: {
    uploadFiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UploadedFilePayload))),
      args: {
        filesList: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FileUploadScalarType))),
        },
      },
      resolve: async (_parent, args: { filesList: UploadedFile[] }) => {
        const { filesList } = args;

        const response: { location: string; mimeType: string }[] = [];
        const filesData = await Promise.all(filesList);
        await filesData.reduce(async (prev, file) => {
          await prev;

          const { createReadStream, mimeType } = file;
          const readStream = createReadStream();
          const filename = `${Date.now()}-${mimeType.replace(/\//, '.')}`;
          const location = path.resolve(__dirname, `../../.files/${filename}`);
          fs.mkdirSync(path.dirname(location), {
            recursive: true,
          });
          const writeStream = fs.createWriteStream(location);

          const writeFile = new Promise<void>(resolve => {
            writeStream.on('close', async () => {
              response.push({
                location,
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
});

const schema = new GraphQLSchema({
  description: 'Testing only',
  types: [FileUploadScalarType],
  query: Query,
  mutation: Mutation,
});

export default schema;
