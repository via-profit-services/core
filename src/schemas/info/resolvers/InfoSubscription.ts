import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { pubsub } from '../../../utils';


const infoSubscriptionResolver: IResolverObject<any, IContext, {str: string}> = {
  info: {
    subscribe: () => pubsub.asyncIterator('info'),
  },
};

export default infoSubscriptionResolver;
