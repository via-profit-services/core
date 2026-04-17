import path from 'node:path';
import fs from 'node:fs';
import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLID,
} from 'graphql';

import type { UploadedFile } from '@via-profit-services/core';
import { FileUploadScalarType, DateTimeScalarType } from '../index';


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

const users: UserType[] = [{ id: '1', name: 'User-001', accountID: '8' }];

const accounts: AccountType[] = [{ id: '8', userID: '1' }];

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
    echoDateTime: {
      args: {
        dt: { type: new GraphQLNonNull(DateTimeScalarType) },
      },
      type: new GraphQLNonNull(DateTimeScalarType),
      resolve: (_, { dt }) => dt,
    },
    echo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        str: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, args) => args.str,
    },
    ping: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => 'pong',
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
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    echo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        str: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, args: { str: string }) => args.str,
    },
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
