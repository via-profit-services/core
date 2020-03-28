import { InfoMutation } from './mutations';
import { InfoQuery } from './queries';

const resolvers = {
  Query: {
    info: () => ({}),
  },
  Mutation: {
    info: () => ({}),
  },
  InfoQuery,
  InfoMutation,
};

export default resolvers;
