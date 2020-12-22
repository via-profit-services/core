import type { Resolvers } from '@via-profit-services/core';

import Phone from './Phone';
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
  Phone,
  ...scalars,
};

export default resolvers;
