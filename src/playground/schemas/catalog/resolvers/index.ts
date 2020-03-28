import { CategoryMutations, ItemMutations } from './mutations';
import { CatalogQuery } from './queries';

const resolvers = {
  Query: { catalog: () => ({}) },
  Mutation: { catalog: () => ({}) },

  CatalogQuery,
  CatalogMutation: {
    category: () => ({}),
    item: () => ({}),
  },
  CategoryMutations,
  ItemMutations,
};

export default resolvers;
