import { IContext } from '../../../types';

const infoSubscriptionResolver = {
  info: {
    subscribe: (parent: any, args: any, context: IContext) => {
      return context.pubsub.asyncIterator('info');
    },
  },
};

export default infoSubscriptionResolver;
