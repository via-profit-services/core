/* eslint-disable no-console */
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createLogger } from 'winston';

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
      context: ({ context }) => ({
          ...context,
          logger: {
            ...context.logger,
            test: createLogger(),
          },
        }),
    },
  ],
});

app.bootstrap(({ resolveUrl }) => {
  const {
    graphql,
    subscriptions,
  } = resolveUrl;


  console.log(`GraphQL server started at ${graphql}`);
  console.log(`Subscription server started at ${subscriptions}`);
});
