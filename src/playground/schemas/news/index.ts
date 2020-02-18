import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';

const DeveloperInfo = new GraphQLObjectType({
  name: 'DeveloperInfo',
  description: 'developer info',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Company name',
    },
    website: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Website URL address',
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      version: {
        description: 'Just version',
        resolve: () => '0.1.1',
        type: new GraphQLNonNull(GraphQLString),
      },
      developer: {
        description: 'Retuen Developer info',
        type: new GraphQLNonNull(DeveloperInfo),
        resolve: () => ({
          name: 'Via Profit',
          website: 'https://via-profit.ru',
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
