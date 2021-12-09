import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    core: {
      description: 'Return @via-profit-services/core version',
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => process.env.CORE_VERSION,
    },
  },
});

export default Query;
