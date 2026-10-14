import { GraphQLID, GraphQLInterfaceType, GraphQLNonNull } from 'graphql';

/**
 * GraphQL Node spec. interface\
 * According to the specification, the Node must contain at least an `id` field with the `ID!` type\
 * \
 * Interface implements the SDL:
 * ```graphql
 * interface Node {
 *   id: String!
 * }
 * ```
 * \
 * Usage example:
 * ```ts
 * import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
 * import { Context, DateTimeScalarType, NodeInterfaceType } from '@via-profit-services/core';
 *
 * const MyNode = new GraphQLObjectType<unknown, Context>({
 *   name: 'MyNode',
 *   interfaces: () => [NodeInterfaceType],
 *   fields: () => ({
 *     id: { type: new GraphQLNonNull(GraphQLID) },
 *     name: { type: new GraphQLNonNull(GraphQLString) },
 *   }),
 * });
 *
 * export default MyNode;
 * ```
 */
const Node = new GraphQLInterfaceType({
  name: 'Node',
  description: 'GraphQL Node spec. interface',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export default Node;
