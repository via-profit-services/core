import { CategoryMutations, ItemMutations } from './mutations';
import { CatalogQueries } from './queries';

const resolvers = {
  Query: { news: () => ({}) },
  Mutation: { news: () => ({}) },

  CatalogQueries,
  CatalogMutations: {
    category: () => ({}),
    item: () => ({}),
  },
  CategoryMutations,
  ItemMutations,
};

export default resolvers;
