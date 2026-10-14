import { GraphQLInterfaceType, GraphQLNonNull, GraphQLList } from 'graphql';

import PageInfo from '../types/PageInfo';
import Edge from './Edge';

/**
 * GraphQL Connection spec. interface\
 * \
 * Interface implements the SDL:
 * ```graphql
 * interface Connection {
 *   pageInfo: PageInfo!
 *   edges: [Edge!]!
 * }
 * ```
 * \
 * Usage example:
 * ```ts
 * import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
 * import { PageInfoType, ConnectionInterfaceType } from '@via-profit-services/core';
 *
 * import MyEdge from './MyEdge';
 *
 * const MyConnection = new GraphQLObjectType({
 *   name: 'MyConnection',
 *   interfaces: [ConnectionInterfaceType],
 *   fields: () => ({
 *     pageInfo: { type: new GraphQLNonNull(PageInfoType) },
 *     edges: {
 *       type: new GraphQLNonNull(
 *         new GraphQLList(
 *           new GraphQLNonNull(MyEdge)
 *         )
 *       )
 *     },
 *   }),
 * });
 *
 * export default MyConnection;
 * ```
 */
const Connection = new GraphQLInterfaceType({
  name: 'Connection',
  description: 'GraphQL Connection spec. interface',
  fields: {
    pageInfo: { type: new GraphQLNonNull(PageInfo) },
    edges: { type: new GraphQLNonNull(new GraphQLList(Edge)) },
  },
});

export default Connection;
