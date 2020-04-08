import { IResolverObject } from 'graphql-tools';
import { pubsub, withFilter } from '../../../utils';

export enum SubscriptioTriggers {
  ACCOUNT_UPDATED = 'account-updated',
  ACCOUNT_DELETED = 'account-deleted',
}

const accountsSubscription: IResolverObject = {
  accountWasUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_UPDATED),
      (payload, variables) => payload.accountWasUpdated.id === variables.id,
    ),
  },
  accountWasDeleted: {
    subscribe: () => pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_DELETED),
  },
};

export default accountsSubscription;
