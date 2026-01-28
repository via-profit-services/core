# API of @via-profit-services/core

## Table of contents

- [graphqlHTTPFactory](#graphqlHTTPFactory)
- [makeGraphQLRequest](#makeGraphQLRequest)

### graphqlHTTPFactory

Function to init the the core.

**Retuns**

An HTTP request listener for NodeJs server


**Parameters**

- `debug` - If is `true`, then graphql response will be contains an `extensions` data object. While error, the extensions object will be contains the `stacktrace` array of errors.

```ts
import http from 'node:http';
import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { graphqlHTTPFactory } from '@via-profit-services/core';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      sayHello: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'Hello string',
        resolve: () => 'Hello',
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
