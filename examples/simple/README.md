# Examples / Simple

To get started, you need:

 - Make GraphQL schema
 - Create HTTP server based on [Express](https://github.com/expressjs/express)
 - Initialize the Core and apply express middleware

```js
const express = require('express');
const http = require('http');
const Core = require('@via-profit-services/core');

const schema = require('./schema');
const port = 9005;

(async () => {

  const app = express();
  const server = http.createServer(app);

  const { graphQLExpress } = await Core.factory({
    introspection: true,
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();

```