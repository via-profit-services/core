## API

## Table of contents

 - [graphqlHTTPFactory](#graphqlHTTPFactory)
 - [makeGraphQLRequest](#makeGraphQLRequest)


### graphqlHTTPFactory

```js
const http = require('node:http');
const { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } = require('graphql');
const { graphqlHTTPFactory } = require('@via-profit-services/core');
/**
 * Simple GraphQL schema
 *
 * SDL of this schema:
 * ```graphql
 * type Query {
 *   version: String!
 * }
 * ```
 */
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      version: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'Application version',
        resolve: () => 'v2.0.x',
      },
    }),
  }),
});


(async () => {
  const port = 8080;

  // This will be Node http server or expressjs server
  const server = http.createServer();

  // Create the HTTP listener for your server
  const graphqlHTTP = graphqlHTTPFactory({
    schema,
  });

  // Your request event
  server.on('request', async (req, res) => {
    // endpoint location
    if (['POST', 'GET'].includes(req.method) && req.url.match(/^\/graphql/)) {
      // Use graphqlHTTP here
      const { data, errors, extensions } = await graphqlHTTP(req, res);

      // Combine server response
      const response = JSON.stringify({ data, errors, extensions });

      // In this example used stream response
      const stream = Readable.from([response]);

      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');

      stream.pipe(res);
    }
  });

  // Start the server
  server.listen(8080, 'localhost', () => {
    console.debug('started at http://localhost:8080/graphql');
  });
})();
```


### makeGraphQLRequest

...