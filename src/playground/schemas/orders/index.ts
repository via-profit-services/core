import OrderResolver from './OrderResolver';
import OrdersQuery from './OrdersQuery';
import * as typeDefs from './schema.graphql';

const resolvers = {
  Query: {
    orders: () => ({}),
  },
  OrdersQuery,
  Order: OrderResolver,
};


export {
  typeDefs,
  resolvers,
};
