import chalk from 'chalk';

import { App } from '../app';
import { configureApp } from '../utils/configureApp';
import { configureTokens } from '../utils/configureTokens';
import * as uploadSchema from './schemas/upload';


const config = configureApp({
  typeDefs: [uploadSchema.typeDefs],
  resolvers: [uploadSchema.resolvers],
});

const app = new App(config);
app.bootstrap(({ resolveUrl, context }) => {
  const {
    graphql, subscriptions, playground, graphiql,
  } = resolveUrl;

  const { accessToken } = configureTokens(['development', 'admin'], context);

  console.log('');
  console.log('Your new development Access Token:');
  console.log(chalk.yellow(accessToken.token));

  console.log('');
  console.log(`Playground started at ${chalk.blue(playground)}`);
  console.log(`Playground graphiql started at ${chalk.magenta(graphiql)}`);
  console.log(`GraphQL server started at ${chalk.yellow(graphql)}`);
  console.log(`Subscription server started at ${chalk.green(subscriptions)}`);
});
