import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

/**
 * GraphQL PageInfo spec. type\
 * \
 * Interface implements the SDL:
 * ```graphql
 * type PageInfo {
 *   hasPreviousPage: Boolean!
 *   hasNextPage: Boolean!
 *   startCursor: String
 *   endCursor: String
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
 *     edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MyEdge))) },
 *   }),
 * });
 *
 * export default MyConnection;
 * ```
 */
const PageInfo = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: {
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
  },
});

export default PageInfo;
