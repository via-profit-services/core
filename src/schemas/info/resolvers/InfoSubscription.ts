import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { pubsub } from '../../../utils';


const infoSubscriptionResolver: IResolverObject<any, IContext, {str: string}> = {
  developerWasChanged: {
    subscribe: () => pubsub.asyncIterator('developerWasChanged'),
  },
};

export default infoSubscriptionResolver;
