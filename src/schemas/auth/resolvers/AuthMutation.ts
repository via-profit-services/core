import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { ServerError } from '../../../errorHandlers';
import { pubsub } from '../../../utils';
import AuthService, { IRefreshToken, TokenType } from '../service';
import { SubscriptioTriggers } from './AuthSubscription';

const driversMutationResolver: IResolverObject<any, IContext> = {
  getAccessToken: async (parent, args: { login: string; password: string }, context) => {
    const { login, password } = args;
    const authService = new AuthService({ context });

    const account = await authService.getAccountByCredentials(login, password);

    const tokenBag = await authService.registerTokens({
      uuid: account.id,
      // deviceInfo: {},
    });

    return tokenBag;
  },
  refreshToken: async (parent, args: { token: string }, context) => {
    const { token } = args;
    const { logger } = context;
    const { publicKey, blackList } = context.jwt;

    const authService = new AuthService({ context });
    const payload = AuthService.verifyToken(String(token), publicKey, blackList) as IRefreshToken['payload'];

    if (payload.type !== TokenType.refresh) {
      logger.auth.info('Tried to refresh token by access token. Rejected', { payload });
      throw new ServerError('Is not a refresh token', { payload });
    }


    // check to token exist
    if (!(await authService.checkTokenExist(payload.id))) {
      logger.auth.info('Tried to refresh token by revoked refresh token. Rejected', { payload });
      throw new ServerError('This token was revoked', { payload });
    }

    // revoke old access token of this refresh
    await authService.revokeToken([payload.associated, payload.id]);

    // create new tokens
    const tokenBag = await authService.registerTokens({
      uuid: payload.uuid,
      // deviceInfo,
    });

    return tokenBag;
  },
  revokeToken: async (parent, args: { id: string }, context) => {
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

};

export default driversMutationResolver;
