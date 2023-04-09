## Getting Started

## Table of contents

- [Installation](#installation)
- [Basic GraphQL server](#basic-graphql-server)

## Installation

First of all you should install some peer dependencies and install the core:

- [Busboy](https://github.com/mscdex/busboy) - A streaming parser for HTML form data for Node. Used for the files upload
- [GraphQL](https://github.com/graphql/graphql-js) - The JavaScript reference implementation for GraphQL

```bash
$ npm install busboy graphql @via-profit-services/core
```

## Simple GraphQL server

To build your first project you should do some things:

- Make your GraphQL schema
- Create an http server

Let's make it:

_./schema.js_

````js
const { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } = require('graphql');

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

module.exports = schema;
````

_./index.js_

```js
const http = require('node:http');
const { graphqlHTTPFactory } = require('@via-profit-services/core');
const schema = require('./schema');

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

SDL:

```graphql
Query {
  version
}
```

Output:

```json
{
  "data": {
    "version": "v2.0.x"
  }
}
```

Now your Graphql server is ready. You can send a graphql request to the address `http://localhost:8080/graphql`.
