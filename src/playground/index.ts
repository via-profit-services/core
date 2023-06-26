import http from 'node:http';
import { Readable } from 'node:stream';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { graphqlHTTPFactory } from '../index';
import FileUpload from '../schema/scalars/FileUpload';
import path from 'node:path';
import type { UploadedFile } from '@via-profit-services/core';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
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
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      uploadFile: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          files: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FileUpload))),
          },
        },
        resolve: async (_p, args: { files: readonly UploadedFile[] }) => {
          const { files } = args;

          const filesData = await Promise.all(files);

          await filesData.reduce(async (prev, file) => {
            await prev;
            const { createReadStream, mimeType, capacitor } = file;
            const readStream = createReadStream();

            const distDir = path.resolve(__dirname, '../.files');
            const name = crypto.randomUUID();
            const ext = mimeType.replace(/^.*?\//, '');
            const writeStream = fs.createWriteStream(`${distDir}/${name}.${ext}`);

            return new Promise<void>((resolve, reject) => {
              writeStream.on('error', err => {
                capacitor.destroy();
                reject(err);
              });
              writeStream.on('finish', () => {
                capacitor.destroy();
                resolve();
              });

              readStream.pipe(writeStream);
            });
          }, Promise.resolve());

          return 'ok';
        },
      },
    }),
  }),
});

const server = http.createServer();
const graphqlHTTP = graphqlHTTPFactory({
  schema,
});

server.on('request', async (req, res) => {
  if (['POST', 'GET'].includes(req.method) && req.url.match(/^\/graphql/)) {
    const { data, errors, extensions } = await graphqlHTTP(req, res);
    const response = JSON.stringify({ data, errors, extensions });
    const stream = Readable.from([response]);

    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');

    stream.pipe(res);
  }
});
server.listen(8081, 'localhost', () => {
  console.debug('started at http://localhost:8081/graphql');
});
