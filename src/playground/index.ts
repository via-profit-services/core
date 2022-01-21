/* eslint-disable no-console */
import http from 'node:http';

import { graphqlHTTPFactory } from '../index';
import schema from './schema';
import middleware from './middleware';
import graphiql from './graphiql';

(async () => {
  const graphiqlApp = graphiql({
    query: `query TestQuery($filter: InputFilter, $first: Int, $last: Int) {\n  test(filter: $filter, first: $first, last: $last)\n}`,
    variables: { first: 10, filter: { ids: ['d4f61bbc-a464-41a0-b98f-a492ffaed564'] } },
    endpoint: '/graphql',
  });

  const graphqlHTTP = graphqlHTTPFactory({
    schema,
    middleware,
  });
  const server = http.createServer();
  server.on('request', async (req, res) => {
    switch (req.url) {
      case '/':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        graphiqlApp(req, res);
        break;

      case '/graphql':
        graphqlHTTP(req, res);
        break;

      case '/test':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end('Test page');
        break;

      default:
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('Page not found');
        break;
    }
  });

  server.listen(8080, () =>
    console.info('GraphQL http server started at http://localhost:8080/graphql'),
  );
})();
