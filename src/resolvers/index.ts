import type { Resolvers } from '@via-profit-services/core';

import scalars from './scalars';

const resolvers: Resolvers = {
  Query: {
    info: () => ({}),
  },
  Mutation: {
    info: () => ({}),
  },
  InfoQuery: {
    version: () => process.env.CORE_VERSION,
  },
  InfoMutation: {
    echo: (_paren, args: { str: string }) => args.str,
  },
  ...scalars,
};

export default resolvers;
