# Использование

```ts
import { App, configureLogger } from '@via-profit-services/core';
import myGraphQLSchema from './my-graphql-schema';

// configure main logger
const logger = configureLogger({
  logDir: 'log', // you should pass the path relative to the project root
});

// create application
const app = new App({
  schemas: [myGraphQLSchema],
  logger,
  jwt: { ... },
  database: { ... },
  ...
});

// autostart server
app.bootstrap();

```