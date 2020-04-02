import chalk from 'chalk';

import { App } from '../app';
import { configureApp } from '../utils/configureApp';

const config = configureApp();

const app = new App(config);
app.bootstrap(({ resolveUrl }) => {
  const {
    graphql, auth, subscriptions, playground,
  } = resolveUrl;

  console.log('');
  console.log(`Playground started at ${chalk.blue(playground)}`);
  console.log(`GraphQL server started at ${chalk.yellow(graphql)}`);
  console.log(`Auth server started at ${chalk.magenta(auth)}`);
  console.log(`Subscription server started at ${chalk.green(subscriptions)}`);
});
