import { IObjectTypeResolver } from 'graphql-tools';
import { withFilter } from '../../../app';
import { IContext } from '../../../types';

export enum SubscriptioTriggers {
  TOKEN_REVOKED = 'token-revoked',
}

const authSubscription: IObjectTypeResolver<any, IContext> = {

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
