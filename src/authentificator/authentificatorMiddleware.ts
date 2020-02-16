import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { IContext } from '~/index';
import {
  AccountStatus,
  Authentificator,
  ResponseErrorType,
  TokenType,
} from './Authentificator';
import Accounts from './models/Accounts';

const authentificatorMiddleware = (config: IMiddlewareConfig) => {
  const { context, authUrl, allowedUrl } = config;
  const { endpoint } = config.context;
  const { publicKey } = config.context.jwt;
  const { logger } = context;

  const authentificator = new Authentificator({ context });

  const router = Router();

  router.post(
    authUrl,
    asyncHandler(async (req: Request, res: Response) => {
      const { body } = req;
      const { login, password } = body;

      logger.auth.info('Access token request', { login });

      const account = await Accounts(context.sequelize).findOne({
        attributes: ['id', 'password', 'status'],
        where: {
          login,
        },
      });

      // account not found
      if (!account || !bcryptjs.compareSync(password, account.password)) {
        logger.auth.error('Account not found', { login });
        return Authentificator.sendResponseError(
          ResponseErrorType.accountNotFound,
          res,
        );
      }

      // account locked
      if (
        account.status === AccountStatus.forbidden &&
        bcryptjs.compareSync(password, account.password)
      ) {
        logger.auth.info('Authentification forbidden', { login });
        return Authentificator.sendResponseError(
          ResponseErrorType.accountForbidden,
          res,
        );
      }

      // success
      if (
        account.status === AccountStatus.allowed &&
        bcryptjs.compareSync(password, account.password)
      ) {
        const payload = {
          id: account.id,
          roles: ['some'],
        };

        const accessToken = authentificator.generateToken(
          TokenType.access,
          payload,
        );
        const refreshToken = authentificator.generateToken(
          TokenType.refresh,
          payload,
        );

        logger.auth.info('Authentification success', {
          login,
          ...accessToken.payload,
        });

        return res.status(200).json({
          accessToken: accessToken.token,
          expiresIn: config.context.jwt.accessTokenExpiresIn,
          refreshToken: refreshToken.token,
        });
      }

      return Authentificator.sendResponseError(
        ResponseErrorType.accountNotFound,
        res,
      );
    }),
  );

  router.use(
    endpoint,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (allowedUrl.includes(req.originalUrl)) {
        return next();
      }

      const token = Authentificator.extractToken(req);
      const validationResult = Authentificator.verifyToken(token, publicKey);

      if (validationResult === true) {
        return next();
      }

      return Authentificator.sendResponseError(
        ResponseErrorType.authentificationRequired,
        res,
      );
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
