import { IResolverObject } from 'graphql-tools';
import { withFilter, IContext } from '../../../app';

export enum SubscriptioTriggers {
  TOKEN_REVOKED = 'token-revoked',
}

const authSubscription: IResolverObject<any, IContext> = {

  // fire when token with variables.id was revoked
  tokenWasRevoked: {

    subscribe: withFilter(
      (parens, args, context: IContext) => {
        return context.pubsub.asyncIterator(SubscriptioTriggers.TOKEN_REVOKED);
      },
      (payload: {
        tokenWasRevoked: string[];
      }, variables: {
        id: string
      }) => payload.tokenWasRevoked.includes(variables.id),
    ),
  },
};

export default authSubscription;
