import { IResolvers } from 'graphql-tools';

import { IContext } from '../../../types';
import DeveloperResolver from './Developer';
import InfoMutationResolver from './InfoMutation';
import InfoQueryResolver from './InfoQuery';
import InfoSubscriptionResolver from './InfoSubscription';

const resolvers: IResolvers<any, IContext> = {
  Query: {
    info: () => ({}),
  },
  Mutation: {
    info: () => ({}),
  },
  Subscription: InfoSubscriptionResolver,
  InfoQuery: InfoQueryResolver,
  InfoMutation: InfoMutationResolver,
  Developer: DeveloperResolver,
};

export default resolvers;
