import { GraphQLEnumType } from 'graphql';

const OrderDirection = new GraphQLEnumType({
  name: 'OrderDirection',
  description: 'Standart ordering options',
  values: {
    ASC: { value: 'ASC' },
    DESC: { value: 'DESC' },
  },
});

export default OrderDirection;
