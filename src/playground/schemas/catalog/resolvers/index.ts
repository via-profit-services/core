import { CategoryMutations, ItemMutations } from './mutations';
import { CatalogQueries } from './queries';

const resolvers = {
  Query: { catalog: () => ({}) },
  Mutation: { catalog: () => ({}) },

  CatalogQueries,
  CatalogMutations: {
    category: () => ({}),
    item: () => ({}),
  },
  CategoryMutations,
  ItemMutations,
};

export default resolvers;
