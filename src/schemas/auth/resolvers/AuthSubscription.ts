import { IResolverObject } from 'graphql-tools';
import { pubsub, withFilter } from '../../../utils';

export enum SubscriptioTriggers {
  TOKEN_REVOKED = 'token-revoked',
}

const authSubscription: IResolverObject = {

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

export default authSubscription;
