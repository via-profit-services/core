import http from 'node:http';
import { Readable } from 'node:stream';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { graphqlHTTPFactory } from '../index';
import FileUpload from '../schema/scalars/FileUpload';
import path from 'node:path';
import type { UploadedFile } from '@via-profit-services/core';
// ----------------------
// Base types
// ----------------------

type UserType = {
  id: string;
  name: string;
  accountID: string;
};

type AccountType = {
  id: string;
  userID: string;
};

type PostType = {
  id: string;
  userID: string;
};

type CommentType = {
  id: string;
  postID: string;
};

// ----------------------
// Mock data
// ----------------------

const users: UserType[] = [
  { id: '1', name: 'User-001', accountID: '8' },
];

const accounts: AccountType[] = [
  { id: '8', userID: '1' },
];

const posts: PostType[] = [
  { id: '101', userID: '1' },
  { id: '102', userID: '1' },
];

const comments: CommentType[] = [
  { id: '1001', postID: '101' },
  { id: '1002', postID: '101' },
  { id: '1003', postID: '102' },
];

// ----------------------
// GraphQL Types
// ----------------------

const Comment = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    comments: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Comment))),
      args: {
        first: { type: GraphQLInt },
      },
      resolve: (post, args) => {
        const list = comments.filter(c => c.postID === post.id);
        return args.first ? list.slice(0, args.first) : list;
      },
    },
  }),
});

const Account = new GraphQLObjectType({
  name: 'Account',
  fields: () => {
    const fields: GraphQLFieldConfigMap<AccountType, unknown> = {
      id: { type: new GraphQLNonNull(GraphQLID) },
      user: {
        type: new GraphQLNonNull(User),
        resolve: parent => users.find(u => u.id === parent.userID),
      },
    };

    return fields;
  },
});

const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    account: {
      type: new GraphQLNonNull(Account),
      resolve: user => accounts.find(a => a.id === user.accountID),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      args: {
        first: { type: GraphQLInt },
      },
      resolve: (user, args) => {
        const list = posts.filter(p => p.userID === user.id);
        return args.first ? list.slice(0, args.first) : list;
      },
    },

    // A deliberately expensive field for testing complexity
    expensiveField: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => 'expensive',
    },
  }),
});

// ----------------------
// Schema
// ----------------------

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      user: {
        type: new GraphQLNonNull(User),
        resolve: () => users[0],
      },

      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        args: {
          first: { type: GraphQLInt },
        },
        resolve: (_p, args) => {
          return args.first ? users.slice(0, args.first) : users;
        },
      },

      accounts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Account))),
        args: {
          first: { type: GraphQLInt },
        },
        resolve: (_p, args) => {
          return args.first ? accounts.slice(0, args.first) : accounts;
        },
      },

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
            const { createReadStream, mimeType, cleanup } = file;
            const readStream = createReadStream();

            const distDir = path.resolve(__dirname, '../.files');
            const name = crypto.randomUUID();
            const ext = mimeType.replace(/^.*?\//, '');
            const writeStream = fs.createWriteStream(`${distDir}/${name}.${ext}`);

            return new Promise<void>((resolve, reject) => {
              writeStream.on('error', err => {
                cleanup();
                reject(err);
              });
              writeStream.on('finish', () => {
                cleanup();
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
