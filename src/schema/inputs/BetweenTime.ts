import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import Time from '../scalars/Time';

const BetweenTime = new GraphQLInputObjectType({
  name: 'BetweenTime',
  fields: {
    start: { type: new GraphQLNonNull(Time) },
    end: { type: new GraphQLNonNull(Time) },
  },
});

export default BetweenTime;
