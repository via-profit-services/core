import { GraphQLInt, GraphQLInterfaceType, GraphQLNonNull, GraphQLList } from 'graphql';

import PageInfo from '../PageInfo';
import Edge from './Edge';

const Connection = new GraphQLInterfaceType({
  name: 'Connection',
  description: 'GraphQL Connection spec. interface',
  fields: {
    totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    pageInfo: { type: new GraphQLNonNull(PageInfo) },
    edges: { type: new GraphQLNonNull(new GraphQLList(Edge)) },
  },
});

export default Connection;
