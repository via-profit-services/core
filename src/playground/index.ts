import http from 'node:http';
import { Readable } from 'node:stream';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { graphqlHTTPFactory } from '../index';

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
