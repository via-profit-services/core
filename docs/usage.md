# Использование

```ts
import { App, configureLogger } from '@via-profit-services/core';
import myGraphQLSchema from './my-graphql-schema';

// configure main logger
const logger = configureLogger({
  logPath: 'log', // you should pass the path relative to the project root
});

const config = {
  schemas: [myGraphQLSchema],
  logger,
  jwt: { ... },
  database: { ... },
};
const app = new App(config);
app.bootstrap();

```