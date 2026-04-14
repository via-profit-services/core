import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
} from 'graphql';
import { graphqlHTTPFactory, DateTimeScalarType } from '../dist/index.js';
import http from 'node:http';
import { Readable } from 'node:stream';

const users = [{ id: '1', name: 'User-001', accountID: '8' }];

const accounts = [{ id: '8', userID: '1' }];

const posts = [
  { id: '101', userID: '1' },
  { id: '102', userID: '1' },
];

const comments = [
  { id: '1001', postID: '101', authorID: '1' },
  { id: '1002', postID: '101', authorID: '1' },
  { id: '1003', postID: '102', authorID: '1' },
];

// ----------------------
// GraphQL Types
// ----------------------

const Comment = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    author: {
      type: User,
      resolve: ({ authorID }) => {
        throw new Error('Permisison denied');
      },
    },
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
    const fields = {
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

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    echo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        str: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, args) => args.str,
    },
    echoDateTime: {
      args: {
        dt: { type: new GraphQLNonNull(DateTimeScalarType) },
      },
      type: new GraphQLNonNull(DateTimeScalarType),
      resolve: (_, { dt }) => dt,
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

const server = http.createServer();

const graphqlHTTP = graphqlHTTPFactory({
  limits: {
    maxGraphQLIntrospectionDepthLimit: 40,
    maxGraphQLDepthLimit: 40,
  },
  debug: true,
  schema: new GraphQLSchema({
    query: Query,
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        echo: {
          type: new GraphQLNonNull(GraphQLString),
          args: {
            str: { type: new GraphQLNonNull(GraphQLString) },
          },
          resolve: (_parent, args) => args.str,
        },
      },
    }),
  }),
});

server.on('request', async (req, res) => {
  // POST или GET на url /graphql
  if (['POST', 'GET'].includes(req.method) && req.url.match(/^\/graphql/)) {
    // обработка запроса
    const { data, errors, extensions } = await graphqlHTTP(req, res);

    // формирование ответа
    const response = JSON.stringify({ data, errors, extensions });

    // создание стрима для ответа
    const stream = Readable.from([response]);

    // для примера статус-код всегда 200 OK
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');

    // отправка ответа
    stream.pipe(res);
  }
});

server.listen(8081, 'localhost', () => {
  console.debug('started at http://localhost:8081/graphql');
});
