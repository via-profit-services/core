import type { Resolvers } from '@via-profit-services/core';

import scalars from './scalars';

const resolvers: Resolvers = {
  Query: {
    core: () => ({}),
  },
  Mutation: {
    core: () => ({}),
  },
  CoreQuery: {
    version: () => process.env.CORE_VERSION,
  },
  CoreMutation: {
    echo: (_paren, args: { str: string }) => args.str,
  },
  ...scalars,
};

export default resolvers;
