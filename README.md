# Via Profit Services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server

## Documentation [here](https://node.e1g.ru/packages/core)

The [MIT](./LICENSE) License.

## Usage

```ts
import http from 'node:http';
import { graphqlHTTPFactory } from '@via-profit-services/core';
import schema from './my-schema';

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
```
