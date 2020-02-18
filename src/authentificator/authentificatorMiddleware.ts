import bcryptjs from 'bcryptjs';
import DeviceDetector from 'device-detector-js';
import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AccountStatus, Authentificator, ResponseErrorType, TokenType } from './Authentificator';
import { IContext } from '~/index';

const authentificatorMiddleware = (config: IMiddlewareConfig) => {
  const { context, authUrl, allowedUrl } = config;
  const { endpoint } = config.context;
  const { publicKey } = config.context.jwt;
  const { logger } = context;

  const authentificator = new Authentificator({ context });

  const router = Router();
  router.post(
    `${authUrl}/access-token`,
    asyncHandler(async (req: Request, res: Response) => {
      const { body, headers } = req;
      const { login, password } = body;

      const deviceDetector = new DeviceDetector();
      const deviceInfo = deviceDetector.parse(headers['user-agent']);

      logger.auth.info('Access token request', { login });

      const account = await authentificator.getAccountByLogin(login);

      // account not found
      if (!account || !bcryptjs.compareSync(password, account.password)) {
        logger.auth.error('Account not found', { login });
        return Authentificator.sendResponseError(ResponseErrorType.accountNotFound, res);
      }

      // account locked
      if (account.status === AccountStatus.forbidden && bcryptjs.compareSync(password, account.password)) {
        logger.auth.info('Authentification forbidden', { login });
        return Authentificator.sendResponseError(ResponseErrorType.accountForbidden, res);
      }

      // success
      if (account.status === AccountStatus.allowed && bcryptjs.compareSync(password, account.password)) {
        const tokens = await authentificator.registerTokens({
          uuid: account.id,
          deviceInfo,
        });

        return res.status(200).json({
          accessToken: tokens.accessToken.token,
          tokenType: 'bearer',
          expiresIn: config.context.jwt.accessTokenExpiresIn,
          refreshToken: tokens.refreshToken.token,
        });
      }

      return Authentificator.sendResponseError(ResponseErrorType.accountNotFound, res);
    }),
  );

  router.post(
    `${authUrl}/refresh-token`,
    asyncHandler(async (req: Request, res: Response) => {
      const { body, headers } = req;
      const { token } = body;

      // try to verify refresh token
      const tokenPayload = Authentificator.verifyToken(token, context.jwt.publicKey);

      if (tokenPayload.type !== TokenType.refresh) {
        logger.auth.info('Tried to refresh token by access token. Rejected', { payload: tokenPayload });
        return Authentificator.sendResponseError(ResponseErrorType.isNotARefreshToken, res);
      }

      // check to token exist
      if (!(await authentificator.checkTokenExist(tokenPayload.id))) {
        logger.auth.info('Tried to refresh token by revoked refresh token. Rejected', { payload: tokenPayload });
        return Authentificator.sendResponseError(ResponseErrorType.tokenWasRevoked, res);
      }

      const deviceDetector = new DeviceDetector();
      const deviceInfo = deviceDetector.parse(headers['user-agent']);

      // revoke old access token of this refresh
      await authentificator.revokeToken(tokenPayload.associated);

      // revoke old refresh token
      await authentificator.revokeToken(tokenPayload.id);

      // create new tokens
      const tokens = await authentificator.registerTokens({
        uuid: tokenPayload.uuid,
        deviceInfo,
      });

      return res.status(200).json({
        accessToken: tokens.accessToken.token,
        tokenType: 'bearer',
        expiresIn: config.context.jwt.accessTokenExpiresIn,
        refreshToken: tokens.refreshToken.token,
      });
    }),
  );

  router.use(
    endpoint,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (allowedUrl.includes(req.originalUrl)) {
        return next();
      }

      const token = Authentificator.extractToken(req);
      Authentificator.verifyToken(token, publicKey);

      return Authentificator.sendResponseError(ResponseErrorType.authentificationRequired, res);
    }),
  );

  return router;
};

export default authentificatorMiddleware;
export { authentificatorMiddleware };

interface IMiddlewareConfig {
  context: IContext;
  authUrl: string;
  allowedUrl: string[];
}
