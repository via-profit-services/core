/* eslint-disable no-console */
import chalk from 'chalk';

import { App } from '../app';
import { configureApp } from '../utils/configureApp';
import { configureTokens } from '../utils/configureTokens';
import * as orders from './schemas/orders';

const config = configureApp({
  typeDefs: [orders.typeDefs],
  resolvers: [orders.resolvers],
});


const app = new App(config);
app.bootstrap(({ resolveUrl, context }) => {
  const {
    graphql, subscriptions, auth,
  } = resolveUrl;

  const { accessToken } = configureTokens(['development', 'admin'], context);

  console.log('');
  console.log('Your new development Access Token:');
  console.log(chalk.yellow(accessToken.token));

  console.log('');
  console.log(`Authorization server started at ${chalk.blue(auth)}`);
  console.log(`GraphQL server started at ${chalk.yellow(graphql)}`);
  console.log(`Subscription server started at ${chalk.green(subscriptions)}`);
});
