import { GraphQLEnumType } from 'graphql';

const OrderDirection = new GraphQLEnumType({
  name: 'OrderDirection',
  description: 'Standart ordering options',
  values: {
    ASC: {
      value: 'asc',
      description: 'Sort the query results in a top to bottom style (e.g.: A->Z)',
    },
    DESC: {
      value: 'desc',
      description: 'Sort the query results in a bottom to top style (e.g.: Z->A)',
    },
  },
});

export default OrderDirection;
