import {
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
import { Authentificator } from '../../authentificator';

const OrderRange = new GraphQLEnumType({
  name: 'OrderRange',
  values: {
    ASC: {
      value: 'ASC',
    },
    DESC: {
      value: 'DESC',
    },
  },
});

const Account = new GraphQLObjectType({
  name: 'Accounts',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    login: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    cursor: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      accounts: {
        description: 'Accounts list',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Account))),
        resolve: async (_, args, context) => {
          const auth = new Authentificator({
            context,
          });
          const { first, after, orderBy } = args;
          const filter = {
            first,
            after,
            orderBy,
          };
          const accountsList = await auth.getAccounts(filter);

          return accountsList;
        },
        args: {
          first: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          after: {
            type: GraphQLString,
          },
          orderBy: {
            type: new GraphQLInputObjectType({
              name: 'AccountsOrderBy',
              fields: {
                column: { type: new GraphQLNonNull(GraphQLString) },
                order: { type: new GraphQLNonNull(OrderRange) },
              },
            }),
          },
        },
      },
    }),
  }),
});

export default schema;

interface IPackage {
  name: string;
  support: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
}
