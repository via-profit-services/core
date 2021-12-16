/* eslint-disable no-console */
import http from 'http';

import * as core from '../index';
import schema from './schema';

(async () => {
  const server = http.createServer();
  const graphQLlistener = await core.factory({
    server,
    schema,
    middleware: ({ context, requestCounter }) => {
      if (requestCounter === 1) {
        context.emitter.on('graphql-error', console.error);
      }

      return { context };
    },
  });

  server.on('request', graphQLlistener);
  server.on('request', (req, res) => {
    if (req.url !== '/graphql') {
      console.log(req.context);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.write('<h1>404 Not found</h1>');
      res.end();
    }
  });

  // Finally start the server
  server.listen(8080, () => {
    // eslint-disable-next-line no-console
    console.info('GraphQL server started at http://localhost:8080/graphql');
  });
})();
