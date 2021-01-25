const { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } = require('graphql');

/**
 * Simple GraphQL schema \
 * \
 * SDL of this schema: 
 * ```graphql
 * type Query {
 *   version: String!
 * }
 * ```
 */
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      version: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'v0.0.2',
      },
    }),
  }),
});

module.exports = schema;