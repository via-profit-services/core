# Introduction of @via-profit-services/core

![via-profit-services-cover](https://github.com/via-profit-services/core/raw/master/assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server


## Features

 - Flexible
 - Middleware supports
 - Files uploading out of box

## Table of contents

 - [Installation](#installation)
 - [Simple GraphQL server](#simple-graphql-server)
 - [Scalar types](./scalars.md)
 - [Context](./context.md)
 - [File uploads](./file-uploads.md)
 - [Cursor pagination](./connections.md)

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

```js
import http from "node:http";
import * as core from "@via-profit-services/core";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";


// Your schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      sayHello: {
        type: new GraphQLNonNull(GraphQLString),
        description: "Hello string",
        resolve: () => "Hello",
      },
    }),
  }),
});


// Create the simple NodeJS HTTP server
const server = http.createServer();

// Create The graphqlHTTP listener
const graphqlHTTP = core.graphqlHTTPFactory({
  schema,
  debug: true, // For display geaphql extensions response
});

// Now you can use graphqlHTTP in your http request
server.on("request", async (req, res) => {
  const { data, errors, extensions } = await graphqlHTTP(req, res);
  const response = JSON.stringify({ data, errors, extensions });

  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.end(response);
});

server.listen(8080, "localhost", () => {
  console.debug("started at http://localhost:8080/graphql");
});

```

SDL:

```graphql
Query {
  sayHello
}
```

Output:

```json
{
  "data": {
    "sayHello": "hello"
  },
  "extensions": {
    "queryTime": "2.213368999771774",
    "requestCounter": 1,
    "startupTime": "2021-04-25T04:36:01.796Z"
  }
}
```

Now your Graphql server is ready. You can send a graphql request to the address `http://localhost:8080/graphql`.


## License

The MIT License (MIT)

Copyright (c) 2020 Via Profit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
