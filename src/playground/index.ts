/* eslint-disable no-console */
import { makeExecutableSchema } from '@graphql-tools/schema';

import Application, { typeDefs, resolvers } from '../index';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const app = new Application({
  schema,
  debug: true,
  enableIntrospection: true,
  port: 9005,
  redis: {
    host: 'localhost',
    port: 6379,
    password: '',
  },
  middlewares: [
    {
      context: ({ context }) => {
        console.log('middleware body')

        return context;
      },
    },
  ],
});

app.bootstrap(({ resolveUrl, context }) => {
  const {
    graphql,
    subscriptions,
  } = resolveUrl;

  const { logger } = context;
  logger.server.debug('Server logger bootstrap')
  // logger.sql.debug('SQL logger bootstrap')
  console.log({ logger })
  console.log('');
  console.log(`GraphQL server started at ${graphql}`);
  console.log(`Subscription server started at ${subscriptions}`);
});
