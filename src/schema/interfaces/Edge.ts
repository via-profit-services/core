import { GraphQLInterfaceType, GraphQLNonNull, GraphQLString } from 'graphql';

import Node from './Node';

const Edge = new GraphQLInterfaceType({
  name: 'Edge',
  description: 'GraphQL Edge spec. interface',
  fields: {
    node: { type: new GraphQLNonNull(Node) },
    cursor: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export default Edge;
