import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../types';

const infoSubscriptionResolver: IResolverObject<any, IContext> = {
  info: {
    subscribe: (parent, args, context) => {
      return context.pubsub.asyncIterator('info');
    },
  },
};

export default infoSubscriptionResolver;
