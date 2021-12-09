import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import Money from '../scalars/Money';

const BetweenMoney = new GraphQLInputObjectType({
  name: 'BetweenMoney',
  fields: {
    start: { type: new GraphQLNonNull(Money) },
    end: { type: new GraphQLNonNull(Money) },
  },
});

export default BetweenMoney;
