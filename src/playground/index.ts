import { makeExecutableSchema } from '@graphql-tools/schema';

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import viaProfitServerFactory, { resolvers, typeDefs } from '../index';


const PORT = 9005;
const LOG_DIR = './artifacts/log';
const app = express();
const server = createServer(app);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const { viaProfitGraphql } = viaProfitServerFactory({
  server,
  schema,
  debug: true,
  enableIntrospection: true,
  logDir: LOG_DIR,
});


app.use(cors());
app.set('trust proxy', true);
app.use('/graphql', viaProfitGraphql);


server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`GraphQL server started at http://localhost:${PORT}/graphql`);
  // eslint-disable-next-line no-console
  console.log(`GraphQL server started at ws://localhost:${PORT}/graphql`);
});
