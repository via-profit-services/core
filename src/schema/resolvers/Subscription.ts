import type { Context } from '@via-profit-services/core';

const Subscription = {
  info: {
    subscribe: (_parent: any, _args: any, context: Context) => context.pubsub.asyncIterator('info'),
  },
};

export default Subscription;
