import { App } from '../app';
import { configureApp } from '../utils/configureApp';
import catalogSchema from './schemas/catalog';
import driversSchema from './schemas/drivers';
import simpleSchema from './schemas/simple';

const config = configureApp({ schemas: [simpleSchema, catalogSchema, driversSchema] });
const app = new App(config);
app.bootstrap(({ resolveUrl }) => {
  const { graphql, auth } = resolveUrl;
  console.log(`GraphQL server started at ${graphql}`);
  console.log(`GraphQL server started at ${auth}`);
});
