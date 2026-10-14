import { GraphQLInterfaceType, GraphQLNonNull, GraphQLString } from 'graphql';

/**
 * GraphQL Error interface\
 * \
 * Interface implements the SDL:
 * ```graphql
 * interface Error {
 *   name: String!
 *   msg: String!
 * }
 * ```
 * \
 * Usage example:
 * ```ts
 * import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
 * import { ErrorInterfaceType } from '@via-profit-services/core';
 *
 * const MyError = new GraphQLObjectType({
 *   name: 'MyError',
 *   interfaces: () => [ErrorInterfaceType],
 *   fields: {
 *     name: { type: new GraphQLNonNull(GraphQLString) },
 *     msg: { type: new GraphQLNonNull(GraphQLString) },
 *   },
 * });
 *
 * export default MyError;
 * ```
 */
const Error = new GraphQLInterfaceType({
  name: 'Error',
  fields: {
    name: {
      description: 'Error name. Can be short error message',
      type: new GraphQLNonNull(GraphQLString),
    },
    msg: {
      description: 'Error detail message string',
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export default Error;
