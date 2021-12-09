import { GraphQLInterfaceType, GraphQLNonNull, GraphQLString } from 'graphql';

const Error = new GraphQLInterfaceType({
  name: 'Error',
  fields: {
    name: {
      description: 'Error name. Can be short error message',
      type: new GraphQLNonNull(GraphQLString),
    },
    msg: {
      description: 'Error detail message string',
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export default Error;
