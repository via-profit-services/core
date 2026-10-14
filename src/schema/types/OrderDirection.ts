import { GraphQLEnumType } from 'graphql';

/**
 * GraphQL type for the data ordering\
 * \
 * Interface implements the SDL:
 * ```graphql
 * enum OrderDirection {
 *   """Sort the query results in a top to bottom style (e.g.: A->Z)"""
 *   ASC
 *
 *   """Sort the query results in a bottom to top style (e.g.: Z->A)"""
 *   DESC
 * }
 * ```
 * \
 * Usage example:
 * ```ts
 * import { GraphQLInputObjectType, GraphQLEnumType, GraphQLNonNull } from 'graphql';
 * import { OrderDirectionType } from '@via-profit-services/core';
 *
 * const MyOrderBy = new GraphQLInputObjectType({
 *   name: 'MyOrderBy',
 *   fields: () => ({
 *     direction: { type: new GraphQLNonNull(OrderDirectionType) },
 *     field: {
 *       type: new GraphQLNonNull(
 *         new GraphQLEnumType({
 *           name: 'BlockOrderField',
 *           values: {
 *             NAME: { value: 'name' },
 *             TYPE: { value: 'type' },
 *           },
 *         }),
 *       ),
 *     },
 *   }),
 * });
 *
 * export default MyOrderBy;
 * ```
 */
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
