import { IResolverObject } from 'graphql-tools';
import { IAccount } from '../../../authentificator';
import { pubsub, withFilter } from '../../../utils';

export enum SubscriptioTriggers {
  ACCOUNT_UPDATED = 'account-updated',
  ACCOUNT_DELETED = 'account-deleted',
  TOKEN_REVOKED = 'token-revoked',
}

const accountsSubscription: IResolverObject = {

  // fire when account with variables.id was updated
  accountWasUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_UPDATED),
      (payload: {
        accountWasUpdated: IAccount;
      }, variables: {
        id: string;
      }) => payload.accountWasUpdated.id === variables.id,
    ),
  },
  accountWasDeleted: {
    subscribe: () => pubsub.asyncIterator(SubscriptioTriggers.ACCOUNT_DELETED),
  },
  // fire when token with variables.id was revoked
  tokenWasRevoked: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptioTriggers.TOKEN_REVOKED),
      (payload: {
        tokenWasRevoked: string[];
      }, variables: {
        id: string
      }) => payload.tokenWasRevoked.includes(variables.id),
    ),
  },
};

export default accountsSubscription;
