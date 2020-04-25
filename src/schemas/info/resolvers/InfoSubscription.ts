import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';

const infoSubscriptionResolver: IResolverObject<any, IContext> = {
  info: {
    subscribe: (parent, args, context) => {
      return context.pubsub.asyncIterator('info');
    },
  },
};

export default infoSubscriptionResolver;
