import chalk from 'chalk';
import { Router } from 'express';

import { App } from '../app';
import { IExpressMidlewareContainer } from '../types';
import { configureApp } from '../utils/configureApp';
import { configureTokens } from '../utils/configureTokens';
import * as uploadSchema from './schemas/upload';

const config = configureApp({
  typeDefs: [uploadSchema.typeDefs],
  resolvers: [uploadSchema.resolvers],
});


interface IMiddlewareProps {
  foo: number;
}

const customMiddleware = (customProps: IMiddlewareProps): IExpressMidlewareContainer => {
  const { foo } = customProps;
  return ({ context }) => {
    const router = Router();
    console.log('dddddddddddddd');
    router.use('/custom', (req, res, next) => {
      console.log(`foo is ${foo}`);
      console.log(`timezone is ${context.timezone}`);
      next();
    });
    return router;
  };
};

config.expressMiddlewares = [
  customMiddleware({ foo: 1234 }),
];

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
