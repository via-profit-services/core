import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import Date from '../scalars/Date';

const BetweenDate = new GraphQLInputObjectType({
  name: 'BetweenDate',
  fields: {
    start: { type: new GraphQLNonNull(Date) },
    end: { type: new GraphQLNonNull(Date) },
  },
});

export default BetweenDate;
