import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import DateTime from '../scalars/DateTime';

const BetweenDateTime = new GraphQLInputObjectType({
  name: 'BetweenDateTime',
  fields: {
    start: { type: new GraphQLNonNull(DateTime) },
    end: { type: new GraphQLNonNull(DateTime) },
  },
});

export default BetweenDateTime;
