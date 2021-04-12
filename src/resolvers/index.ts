import type { Resolvers } from '@via-profit-services/core';

import scalars from './scalars';

const resolvers: Resolvers = {
  Query: {
    core: () => process.env.CORE_VERSION,
  },
  Mutation: {
    core: (_paren, args) => args.str,
  },
  ...scalars,
};

export default resolvers;
