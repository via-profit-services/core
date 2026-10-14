import { GraphQLInterfaceType, GraphQLNonNull, GraphQLString } from 'graphql';

import Node from './Node';

/**
 * GraphQL Edge spec. interface\
 * According to the specification, the Edge must contain
 * at least an `cursor` field with the type of `String!`
 * and the `node` field with type of your Node
 * \
 * Interface implements the SDL:
 * ```graphql
 * interface Edge {
 *   node: SomeNode!
 *   cursor: String!
 * }
 * ```
 * \
 * Usage example:
 * ```ts
 * import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
 * import { EdgeInterfaceType } from '@via-profit-services/core';
 *
 * import MyNode from './MyNode';
 *
 * const MyEdge = new GraphQLObjectType({
 *   name: 'MyEdge',
 *   interfaces: [EdgeInterfaceType],
 *   fields: () => ({
 *     cursor: { type: new GraphQLNonNull(GraphQLString) },
 *     node: { type: new GraphQLNonNull(MyNode) },
 *   }),
 * });
 *
 * export default MyEdge;
 * ```
 */
const Edge = new GraphQLInterfaceType({
  name: 'Edge',
  description: 'GraphQL Edge spec. interface',
  fields: {
    node: { type: new GraphQLNonNull(Node) },
    cursor: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export default Edge;
