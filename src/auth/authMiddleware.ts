import { Router } from 'express';

import AuthService from '../schemas/auth/service';
import { AccountStatus, TokenType } from '../schemas/auth/types';
import { IContext } from '../types';


interface IAuthMiddlewareConfig {
  context: IContext;
  endpoint: string;
}

interface IGetAccessTokenArgs {
  login: string;
  password: string;
}

interface IVerifyTokenArgs {
  token: string;
}

interface IRefreshTokenArgs {
  token: string;
}

export default (config: IAuthMiddlewareConfig) => {
  const { context, endpoint } = config;
  const { logger, deviceInfo } = context;

  const router = Router();
  const authService = new AuthService({ context });

  router.post<any, any, IGetAccessTokenArgs>(`${endpoint}/get-access-token`, async (request, response) => {
    const { body } = request;
    const { login, password } = body;

    const account = await authService.getAccountByCredentials(String(login), String(password));

    if (!account) {
      logger.auth.info(`Authorization attempt with login «${login}» failed. Invalid login or password`);

      return response.status(401).send({
        errors: [{ message: 'Invalid login or password' }],
      });
    }

    if (account.status === AccountStatus.forbidden) {
      logger.auth.info(`Authorization attempt with login «${login}» failed. Account locked`);

      return response.status(401).send({
        errors: [{ message: 'Account locked' }],
      });
    }

    logger.auth.info(`Authorization attempt with login «${login}» success`);
    const tokenBag = await authService.registerTokens({
      uuid: account.id,
      deviceInfo,
    });

    return response.status(200).send(tokenBag);
  });

  router.post<any, any, IVerifyTokenArgs>(`${endpoint}/verify-token`, async (request, response) => {
    const { body } = request;
    const { token } = body;

    const tokenBag = await authService.verifyToken(String(token));
    if (tokenBag === false) {
      logger.auth.info('Token is invalid');

      return response.status(200).send({
        status: false,
        reason: 'Token is invalid',
        result: null,
      });
    }

    logger.auth.info('Token verification success');

    return response.status(200).send({
      status: true,
      reason: 'Token is valid',
      result: tokenBag,
    });
  });

  router.post<any, any, IRefreshTokenArgs>(`${endpoint}/refresh-token`, async (request, response) => {
    const { body } = request;
    const { token } = body;

    const payload = await authService.verifyToken(String(token));

    if (!payload) {
      logger.auth.info('Token is invalid', { payload });

      return response.status(400).send({
        errors: [{ message: 'Token is invalid' }],
      });
    }

    if (payload.type !== TokenType.refresh) {
      logger.auth.info('Tried to refresh token by access token. Rejected', { payload });

      return response.status(400).send({
        errors: [{ message: 'Is not a refresh token' }],
      });
    }

    // check to token exist
    if (!(await authService.checkTokenExist(payload.id))) {
      logger.auth.info('Tried to refresh token by revoked refresh token. Rejected', { payload });

      return response.status(400).send({
        errors: [{ message: 'This token was revoked' }],
      });
    }

    // revoke old access token of this refresh
    await authService.revokeToken([payload.associated, payload.id]);

    // create new tokens
    const tokenBag = await authService.registerTokens({
      uuid: payload.uuid,
      deviceInfo,
    });

    logger.auth.info('Token refreshing success');

    return response.status(200).send(tokenBag);
  });

  router.post(`${endpoint}*`, (request, response) => {
    const { originalUrl } = request;
    logger.server.debug(`Invalid post request ${originalUrl}`);

    return response.status(404).send({
      errors: [{ message: 'The address is not served' }],
    });
  });

  router.get(`${endpoint}*`, (request, response) => {
    const { originalUrl } = request;
    logger.server.debug(`Invalid get request ${originalUrl}`);

    return response.status(404).send({
      errors: [{ message: 'The address is not served' }],
    });
  });

  return router;
};
