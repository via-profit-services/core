import DeviceDetector from 'device-detector-js';
import {
  Request, Response, Router,
} from 'express';
import asyncHandler from 'express-async-handler';
import { IContext } from '../app';
import { TOKEN_BEARER, TOKEN_ACCESS_TOKEN_COOKIE_KEY, TOKEN_REFRESH_TOKEN_COOKIE_KEY } from '../utils';
import { Authentificator, ResponseErrorType, TokenType } from './authentificator';

const authentificatorMiddleware = (config: IMiddlewareConfig) => {
  const { context, authUrl, useCookie } = config;
  const { publicKey } = config.context.jwt;
  const { logger } = context;

  const authentificator = new Authentificator({ context });

  const router = Router();

  /**
   * Route serving access token requests
   * This point response JSON object with token data:
   * e.g. {
   *  accessToken: "XXXXXXXXXXXXXXX...",
   *  tokenType: "bearer",
   *  expiresIn: 1582178054
   *  refreshToken: "XXXXXXXXXXXXXXX..."
   * }
   * @param  {Request} req The request
   * @param  {Response} res The response
   * @param  {string} req.body.login Account login
   * @param  {string} req.body.password Account password
   * @param  {Response} res
   */
  router.post(
    `${authUrl}/access-token`,
    asyncHandler(async (req: Request, res: Response) => {
      const { body, headers } = req;

      const deviceDetector = new DeviceDetector();
      const deviceInfo = deviceDetector.parse(headers['user-agent']);

      const { login, password } = body;

      if (typeof login !== 'string' || typeof password !== 'string') {
        logger.auth.info('Tried to get access token without login or password. Rejected', { body });
        return Authentificator.sendResponseError(ResponseErrorType.authentificationRequired, res);
      }

      logger.auth.info('Access token request', { login });

      const { error, account } = await authentificator.getAccountByLogin(login, password);

      if (typeof error !== 'undefined' || account === false) {
        logger.auth.error(error, { login });
        return Authentificator.sendResponseError(error, res);
      }

      // success
      const tokens = await authentificator.registerTokens({
        uuid: account.id,
        deviceInfo,
      });

      if (useCookie) {
        // set Access token cookie
        res.cookie(TOKEN_ACCESS_TOKEN_COOKIE_KEY, tokens.accessToken.token, {
          expires: new Date(new Date().getTime() + config.context.jwt.accessTokenExpiresIn * 1000),
          signed: true,
          httpOnly: true,
          secure: true,
        });

        // set Access token cookie
        res.cookie(TOKEN_REFRESH_TOKEN_COOKIE_KEY, tokens.refreshToken.token, {
          expires: new Date(new Date().getTime() + config.context.jwt.refreshTokenExpiresIn * 1000),
          signed: true,
          httpOnly: true,
          secure: true,
        });
      }

      const authResponse: AuthorizationResponse = {
        accessToken: tokens.accessToken.token,
        tokenType: TOKEN_BEARER,
        expiresIn: config.context.jwt.accessTokenExpiresIn,
        refreshToken: tokens.refreshToken.token,
      };

      return res.status(200).json(authResponse);
    }),
  );

  /**
   * Route serving refresh token requests
   * This point response JSON object with token data:
   * e.g. {
   *  accessToken: "XXXXXXXXXXXXXXX...",
   *  tokenType: "bearer",
   *  expiresIn: 1582178054
   *  refreshToken: "XXXXXXXXXXXXXXX..."
   * }
   * @param  {Request} req The request
   * @param  {Response} res The response
   * @param  {string} req.RefreshToken Valid refresh token
   * @param  {Response} res
   */
  router.post(
    `${authUrl}/refresh-token`,
    asyncHandler(async (req: Request, res: Response) => {
      const { headers } = req;

      const token = Authentificator.extractToken(TokenType.refresh, req);

      if (token === '') {
        logger.auth.info('Tried to refresh token without token. Rejected');
        return Authentificator.sendResponseError(ResponseErrorType.tokenVerificationFailed, res);
      }

      // try to verify refresh token
      const tokenPayload = Authentificator
        .verifyToken(token, context.jwt.publicKey, context.jwt.blackList);

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

      // create new tokens
      const tokens = await authentificator.registerTokens({
        uuid: tokenPayload.uuid,
        deviceInfo,
      });

      if (useCookie) {
        // set Access token cookie
        res.cookie(TOKEN_ACCESS_TOKEN_COOKIE_KEY, tokens.accessToken.token, {
          expires: new Date(new Date().getTime() + config.context.jwt.accessTokenExpiresIn * 1000),
          signed: true,
          httpOnly: true,
          secure: true,
        });

        // set Refresh token cookie
        res.cookie(TOKEN_REFRESH_TOKEN_COOKIE_KEY, tokens.refreshToken.token, {
          expires: new Date(new Date().getTime() + config.context.jwt.refreshTokenExpiresIn * 1000),
          signed: true,
          httpOnly: true,
          secure: true,
        });
      }
      const authResponse: AuthorizationResponse = {
        accessToken: tokens.accessToken.token,
        tokenType: TOKEN_BEARER,
        expiresIn: config.context.jwt.accessTokenExpiresIn,
        refreshToken: tokens.refreshToken.token,
      };

      return res.status(200).json(authResponse);
    }),
  );

  /**
   * Route serving token validation requests
   * This point response JSON object with token payload data
   * @param  {Request} req The request
   * @param  {Response} res The response
   * @param  {string} req.token Valid refresh token
   * @param  {Response} res
   */
  router.post(
    `${authUrl}/validate-token`,
    asyncHandler(async (req: Request, res: Response) => {
      const { body } = req;
      const { token } = body;

      if (typeof token !== 'string') {
        return Authentificator.sendResponseError(ResponseErrorType.tokenVerificationFailed, res);
      }

      try {
        const payload = Authentificator.verifyToken(
          String(token),
          publicKey,
          context.jwt.blackList,
        );

        return res.json(payload);
      } catch (err) {
        return Authentificator.sendResponseError(ResponseErrorType.tokenVerificationFailed, res);
      }
    }),
  );


  return router;
};

export default authentificatorMiddleware;
export { authentificatorMiddleware };

interface AuthorizationResponse {
  accessToken: string;
  tokenType: typeof TOKEN_BEARER;

  /**
   * Token expires time in seconds
   */
  expiresIn: number;
  refreshToken: string;
}

interface IMiddlewareConfig {
  context: IContext;
  authUrl: string;
  useCookie?: boolean;
  allowedUrl?: string[];
}
