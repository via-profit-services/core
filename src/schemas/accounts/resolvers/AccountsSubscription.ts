import { IResolverObject } from 'graphql-tools';
import { withFilter } from '../../../app';
import { IAccount } from '../service';

export enum SubscriptioTriggers {
  ACCOUNT_UPDATED = 'account-updated',
  ACCOUNT_DELETED = 'account-deleted',
  TOKEN_REVOKED = 'token-revoked',
}

const accountsSubscription: IResolverObject = {

  // fire when account with variables.id was updated
  accountWasUpdated: {
    subscribe: withFilter(
      (parent, args, context) => {
        return context.pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_UPDATED);
      },
      (payload: {
        accountWasUpdated: IAccount;
      }, variables: {
        id: string;
      }) => payload.accountWasUpdated.id === variables.id,
    ),
  },
  accountWasDeleted: {
    subscribe: (parent, args, context) => {
      return context.pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_DELETED);
    },
  },
  // fire when token with variables.id was revoked
  tokenWasRevoked: {
    subscribe: withFilter(
      (parent, args, context) => context.pubsub.asyncIterator(SubscriptioTriggers.TOKEN_REVOKED),
      (payload: {
        tokenWasRevoked: string[];
      }, variables: {
        id: string
      }) => payload.tokenWasRevoked.includes(variables.id),
    ),
  },
};

export default accountsSubscription;
