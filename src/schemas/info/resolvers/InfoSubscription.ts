import { IContext } from '../../../types';

const infoSubscriptionResolver = {
  info: {
    subscribe: (parent: any, args: any, context: IContext) => context.pubsub.asyncIterator('info'),
  },
};

export default infoSubscriptionResolver;
