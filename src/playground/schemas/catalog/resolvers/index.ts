import { CategoryMutations, ItemMutations } from './mutations';
import { NewsQueries } from './queries';

const resolvers = {
  Query: { news: () => ({}) },
  Mutation: { news: () => ({}) },

  NewsQueries,
  NewsMutations: {
    category: () => ({}),
    item: () => ({}),
  },
  CategoryMutations,
  ItemMutations,
};

export default resolvers;
