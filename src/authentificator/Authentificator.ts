import { Request, Response } from 'express';
import fs from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';

import { IContext, ServerError } from '~/index';

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}

export class Authentificator {
  private props: IProps;

  public constructor(props: IProps) {
    this.props = props;
  }

  public static extractToken(request: Request): string | undefined {
    const { headers } = request;
    const { authorization } = headers;
    const bearer = String(authorization).split(' ')[0];
    const token = String(authorization).split(' ')[1];

    return bearer.toLocaleLowerCase() === 'bearer' ? token : '';
  }

  public static verifyToken(token: string, publicKeyPath: string): boolean {
    if (token === null) {
      return false;
    }

    try {
      const publicKey = fs.readFileSync(publicKeyPath);
      jwt.verify(String(token), publicKey);
      return true;
    } catch (err) {
      // logger.server.error(err);
      console.log(err.name, err.message);
      return false;
    }
  }

  public generateToken(
    type: TokenType,
    payload: Omit<ITokenPayload, 'type'>,
  ): ITokenInfo {
    const { context } = this.props;
    const { logger } = context;

    // check file to access and readable
    try {
      fs.accessSync(context.jwt.privateKey);
    } catch (err) {
      throw new ServerError('Failed to open JWT privateKey file', { err });
    }

    const privatKey = fs.readFileSync(context.jwt.privateKey);

    const options: SignOptions = {
      algorithm: context.jwt.algorithm,
      issuer: context.jwt.issuer,
    };

    let token: string;
    let tokenPayload: ITokenPayload;

    switch (type) {
      // Access token
      case TokenType.access:
        tokenPayload = { ...payload, ...{ type: TokenType.access } };
        options.expiresIn = context.jwt.accessTokenExpiresIn;
        token = jwt.sign(payload, privatKey, options);
        break;

      // RefreshToken
      case TokenType.refresh:
        tokenPayload = { ...payload, ...{ type: TokenType.refresh } };
        options.expiresIn = context.jwt.refreshTokenExpiresIn;
        token = jwt.sign(payload, privatKey, options);
        break;

      default:
        break;
    }

    logger.auth.info('New token was generated', { tokenPayload });

    return {
      payload: tokenPayload,
      token,
    };
  }

  public static sendResponseError(
    responsetype: ResponseErrorType,
    resp: Response,
  ) {
    const errors: IResponseError[] = [];

    switch (responsetype) {
      case 'accountForbidden':
        errors.push({
          message: 'Account locked',
          name: 'Authorization error',
        });
        break;
      case 'authentificationRequired':
        errors.push({
          message: 'Authentication Required',
          name: 'Authorization error',
        });
        break;

      case 'accountNotFound':
      case 'invalidLoginOrPassword':
      default:
        errors.push({
          message: 'Invalid login or password',
          name: 'Authorization error',
        });
        break;
    }

    return resp.status(401).json({ errors });
  }
}

interface IProps {
  context: IContext;
}

/**
 * JWT configuration. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
 */

export interface IJwtConfig extends Pick<SignOptions, 'algorithm' | 'issuer'> {
  accessTokenExpiresIn: SignOptions['expiresIn'];
  refreshTokenExpiresIn: SignOptions['expiresIn'];
  /**
   * Cert private key file path
   */
  privateKey: string;
  /**
   * Cert public key file path
   */
  publicKey: string;
}

export interface ITokenPayload {
  type: TokenType;
  id: string;
  roles: string[];
}

export interface ITokenInfo {
  token: string;
  payload: ITokenPayload;
}

export enum ResponseErrorType {
  authentificationRequired = 'authentificationRequired',
  accountNotFound = 'accountNotFound',
  accountForbidden = 'accountForbidden',
  invalidLoginOrPassword = 'invalidLoginOrPassword',
}

export interface IResponseError {
  name: string;
  message: string;
}

export enum AccountStatus {
  allowed = 'allowed',
  forbidden = 'forbidden',
}
