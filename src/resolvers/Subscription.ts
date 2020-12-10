import type { Context } from '@via-profit-services/core';

interface InfoSource {
  info: string;
}

const Subscription = {
  info: {
    subscribe: (_parent: any, _args: any, context: Context) => context.pubsub.asyncIterator('info'),
    resolve: (source: InfoSource) => source.info,
  },
};

export default Subscription;
