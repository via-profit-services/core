import { App } from '../app';
import { configureApp } from '../utils/configureApp';
import * as catalog from './schemas/catalog';
import * as drivers from './schemas/drivers';

const config = configureApp({
  typeDefs: [catalog.typeDefs, drivers.typeDefs],
  resolvers: [catalog.resolvers, drivers.resolvers],
});

const app = new App(config);
app.bootstrap(({ resolveUrl }) => {
  const { graphql, auth } = resolveUrl;
  console.log(`GraphQL server started at ${graphql}`);
  console.log(`GraphQL server started at ${auth}`);
});
