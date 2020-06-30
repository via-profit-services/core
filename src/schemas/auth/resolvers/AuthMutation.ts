import { IResolverObject } from 'graphql-tools';

import { ServerError, BadRequestError, UnauthorizedError } from '../../../errorHandlers';
import { IContext } from '../../../types';
import AuthService, { TokenType } from '../service';
import { SubscriptioTriggers } from './AuthSubscription';

const authMutationResolver: IResolverObject<any, IContext> = {
  getAccessToken: async (parent, args: { login: string; password: string }, context) => {
    const { login, password } = args;
    const { deviceInfo } = context;
    const authService = new AuthService({ context });

    const account = await authService.getAccountByCredentials(login, password);

    const tokenBag = await authService.registerTokens({
      uuid: account.id,
      deviceInfo,
    });

    return tokenBag;
  },
  refreshToken: async (parent, args: { token: string }, context) => {
    const { token } = args;
    const { logger, deviceInfo } = context;

    const authService = new AuthService({ context });
    const payload = await authService.verifyToken(String(token));

    if (!payload) {
      logger.auth.info('Invalid token', { payload });
      throw new UnauthorizedError('Invalid token', { payload });
    }

    if (payload.type !== TokenType.refresh) {
      logger.auth.info('Tried to refresh token by access token. Rejected', { payload });
      throw new BadRequestError('Is not a refresh token', { payload });
    }


    // check to token exist
    if (!(await authService.checkTokenExist(payload.id))) {
      logger.auth.info('Tried to refresh token by revoked refresh token. Rejected', { payload });
      throw new BadRequestError('This token was revoked', { payload });
    }

    // revoke old access token of this refresh
    await authService.revokeToken([payload.associated, payload.id]);

    // create new tokens
    const tokenBag = await authService.registerTokens({
      uuid: payload.uuid,
      deviceInfo,
    });

    return tokenBag;
  },
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
