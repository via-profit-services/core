## Getting Started

## Table of contents

- [Installation](#installation)
- [Basic GraphQL server](#basic-graphql-server)
- [GraphQL server with @graphql-tools](#graphql-server-with-graphql-tools)
- [More examples](#more-examples)

## Installation

First of all you should install some peer dependencies and install the core:

- [Express](https://github.com/expressjs/express) - Node HTTP Server
- [GraphQL](https://github.com/graphql/graphql-js) - The JavaScript reference implementation for GraphQL

```bash
$ yarn add express graphql @via-profit-services/core
```

## Basic GraphQL server

To build your first project you should do some things:

- Make your GraphQL schema
- Create an http server using `factory` promise

_Note: See the [factory api](./api.md#factory) for details on parameters_

Let's make it:

_./schema.js_

````js
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString.
} = require('graphql');

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
        resolve: () => 'v2.0.x',
      },
    }),
  }),
});

module.exports = schema;
````

_./index.js_

```js
const { createServer } = require("http");
const express = require("express");
const core = require("@via-profit-services/core");
const schema = require("./schema");

(async () => {
  const port = 8080;
  const app = express();
  const server = createServer(app);

  const { graphQLExpress } = await factory({
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at port ${port}`);
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

Now your Graphql server is ready. You can send a graphgql request to the address `http://localhost:8080/graphql`.


[![Edit @via-profit-services-core-node-basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-node-basic-xii7w?fontsize=14&hidenavigation=1&theme=dark&view=editor)


## GraphQL server with @graphql-tools

In the previous paragraph, you learned how to configure a simple GraphQL server using vanilla graphql. But we strongly recommend using [@graphql-tools](https://github.com/ardatan/graphql-tools) package to build your schemas. This package helps to combine SDL and resolvers into a single executable schema. See `makeExecutableSchema` of `@graphql-tools/schema` module.

Core module also exports its own typeDefs and resolvers. Those definitions would declare Query and Mutation root types. See [API](./api.md) and [Type defs](./typedefs.md) for more details.

With @graphql-tools example:

```js
const { createServer } = require("http");
const express = require("express");
const core = require("@via-profit-services/core");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = /* GraphQL */ `
  extend type Query {
    """
    DateTime type is a scalar type added from Core typeDefs
    """
    currentDate: DateTime!
  }
`;

const resolvers = {
  Query: {
    currentDate: () => new Date(),
  },
};

(async () => {
  const port = 8080;
  const app = express();
  const server = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs: [
      core.typeDefs,
      typeDefs, // <-- Put your types here
    ],
    resolvers: [
      core.resolvers,
      resolvers, // <-- Put your resolvers here
    ],
  });

  const { graphQLExpress } = await core.factory({
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at port ${port}`);
  });
})();
```

[![Edit @via-profit-services-core-node-graphql-tools](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-node-graphql-tools-04s8s?fontsize=14&hidenavigation=1&theme=dark)


The **@via-profit-services/core** module has an extensive API that you can find in the [API section](./api.md).


## More examples

We have collected all examples in one place. [Here](./examples.md).
