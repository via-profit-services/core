import { App } from '@via-profit-services/core';

import configureApp from './utils/configureApp';
import * as orders from './schemas/orders';

const config = configureApp({
  typeDefs: [orders.typeDefs],
  resolvers: [orders.resolvers],
});


const app = new App(config);
app.bootstrap(({ resolveUrl }) => {
  const {
    graphql,
    subscriptions,
    auth,
  } = resolveUrl;

  console.log('');
  console.log(`Authorization server started at ${auth}`);
  console.log(`GraphQL server started at ${graphql}`);
  console.log(`Subscription server started at ${subscriptions}`);
});
