import { IResolverObject } from 'graphql-tools';

import { ServerError } from '../../../errorHandlers';
import { IContext } from '../../../types';
import AuthService from '../service';
import { SubscriptioTriggers } from './AuthSubscription';

const authMutationResolver: IResolverObject<any, IContext> = {
  revokeToken: async (parent, args: { id: string }, context) => {
    const { pubsub } = context;
    const { id } = args;

    try {
      const authService = new AuthService({ context });
      await authService.revokeToken(id);

      pubsub.publish(SubscriptioTriggers.TOKEN_REVOKED, {
        tokenWasRevoked: [id],
      });

      return true;
    } catch (err) {
      throw new ServerError(`Failed to revoke token ${id}`, { id });
    }
  },
  revokeAllTokens: async (parent, args: { account: string }, context) => {
    const { pubsub } = context;
    const { account } = args;

    try {
      const authService = new AuthService({ context });
      const tokenIds = await authService.revokeAccountTokens(account);

      pubsub.publish(SubscriptioTriggers.TOKEN_REVOKED, {
        tokenWasRevoked: tokenIds,
      });

      return true;
    } catch (err) {
      throw new ServerError(`Failed to revoke account tokens ${account}`, { account });
    }
  },
};

export default authMutationResolver;
