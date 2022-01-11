import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull } from 'graphql';

const BetweenInt = new GraphQLInputObjectType({
  name: 'BetweenInt',
  fields: {
    start: { type: new GraphQLNonNull(GraphQLInt) },
    end: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export default BetweenInt;
