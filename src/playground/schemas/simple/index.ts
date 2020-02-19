import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';

const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'Current Post data',
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Post Title',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'URL address',
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      post: {
        type: new GraphQLNonNull(Post),
        resolve: () => ({
          title: 'Lorem ipsum',
          url: 'hppts://google.com',
        }),
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      setAny: {
        description: 'Set any value for test mutation',
        args: {
          name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Any value string',
          },
        },
        resolve: () => true,
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    }),
  }),
});

export default schema;
