const express = require('express');
const http = require('http');
const { factory } = require('@via-profit-services/core');

const schema = require('./schema');
const port = 9005;

(async () => {

  const app = express();
  const server = http.createServer(app);

  const { graphQLExpress } = await factory({
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();