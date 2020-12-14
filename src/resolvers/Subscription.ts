import type { Context } from '@via-profit-services/core';

interface InfoSource {
  info: string;
}

const Subscription = {
  // info: {
  //   subscribe: (parent: any, _args: any, context: Context) => {
  //     console.log('subscribe');

  //     return context.pubsub.asyncIterator('info');
  //   },
  //   resolve: (testString: string) => {
  //     console.log('resolve')

  //     return testString;
  //   },
  // },
  info: {
    // subscribe: (_parent: any, _args: any, context: Context) => context.pubsub.asyncIterator('info'),
    // resolve: (source: InfoSource) => source.info,
  },
};

export default Subscription;
