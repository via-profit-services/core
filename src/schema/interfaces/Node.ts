import { GraphQLID, GraphQLInterfaceType, GraphQLNonNull } from 'graphql';

const Node = new GraphQLInterfaceType({
  name: 'Node',
  description: 'GraphQL Node spec. interface',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export default Node;
