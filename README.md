# Via Profit Services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server

## Documentation [here](./docs/introduction.md)

The [MIT](./LICENSE) License.

## Peer dependencies

- [GraphQL](https://github.com/graphql/graphql-js) - The JavaScript reference implementation for GraphQL
- [Busboy](https://github.com/mscdex/busboy) - A streaming parser for HTML form data for Node. Used for the files upload

## Installation

```bash
$ npm install busboy graphql @via-profit-services/core
```

## Usage

```ts
import http from 'node:http';
import { Readable } from 'node:stream';
import { graphqlHTTPFactory } from '@via-profit-services/core';

import schema from './my-schema';

// Create the simple NodeJS HTTP server
const server = http.createServer();

// Create The graphqlHTTP listener
const graphqlHTTP = graphqlHTTPFactory({
  schema,
  debug: true, // For display geaphql extensions response
});

// Now you can use graphqlHTTP in your http request
server.on("request", async (req, res) => {
  // Allow only POST/GET request on `/graphql`
  if (
    ["POST", "GET"].includes(req.method) &&
    req.url.match(/^\/graphql(\?|$)/)
  ) {
    const { data, errors, extensions } = await graphqlHTTP(req, res);
    const response = JSON.stringify({ data, errors, extensions });
    const stream = Readable.from([response]);

    res.statusCode = 200;
    res.setHeader("content-type", "application/json");

    stream.pipe(res);
  }
});

server.listen(8080, "localhost", () => {
  console.debug("started at http://localhost:8080/graphql");
});
```

## Documentation [here](./docs/introduction.md)