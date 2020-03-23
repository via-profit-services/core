import fs from 'fs';
import bcryptjs from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { IContext } from '../app';
import { ServerError, UnauthorizedError } from '../errorHandlers';
import { TOKEN_AUTHORIZATION_KEY, TOKEN_BEARER } from '../utils';
import { IListResponse, IKnexFilterDefaults } from '../utils/generateCursorBundle';

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}

export enum AccountStatus {
  allowed = 'allowed',
  forbidden = 'forbidden',
}

export enum ResponseErrorType {
  authentificationRequired = 'authentificationRequired',
  accountNotFound = 'accountNotFound',
  accountForbidden = 'accountForbidden',
  invalidLoginOrPassword = 'invalidLoginOrPassword',
  tokenExpired = 'tokenExpired',
  isNotAnAccessToken = 'isNotAnAccessToken',
  isNotARefreshToken = 'isNotARefreshToken',
  tokenWasRevoked = 'tokenWasRevoked',
}

export class Authentificator {
  private props: IProps;

  public constructor(props: IProps) {
    this.props = props;
  }

  /**
   * Crypt password string by bcryptjs
   * @param  {string} password
   * @returns password hash
   */
  public static cryptUserPassword(password: string) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(password, salt);
  }

  /**
   * Verify JWT token
   * @param  {string} token
   * @param  {string} publicKeyPath
   * @returns ITokenInfo['payload']
   */
  public static verifyToken(token: string, publicKeyPath: string): ITokenInfo['payload'] {
    if (token === null || token === '') {
      throw new UnauthorizedError('The token must be provided');
    }

    try {
      const publicKey = fs.readFileSync(publicKeyPath);
      const payload = jwt.verify(String(token), publicKey) as ITokenInfo['payload'];
      return payload;
    } catch (err) {
      throw new UnauthorizedError('Token verification failed', err);
    }
  }

  /**
   * Register tokens
   * @param  {{uuid:string;deviceInfo:{};}} data
   * @returns ITokenInfo
   */
  public async registerTokens(data: { uuid: string; deviceInfo: {} }): Promise<ITokenPackage> {
    const { context } = this.props;
    const { knex, logger } = context;

    const account = await knex
      .select<any, Pick<IAccount, 'id' | 'roles'>[]>(['id', 'roles'])
      .from('accounts')
      .where({
        id: data.uuid,
      })
      .first();

    if (typeof account.id !== 'string') {
      throw new ServerError(`Account with id[${account.id}] not found`);
    }

    const tokens = this.generateTokens({
      uuid: account.id,
      roles: account.roles,
    });

    // Register access token
    try {
      await knex('tokens').insert({
        id: tokens.accessToken.payload.id,
        account: tokens.accessToken.payload.uuid,
        type: TokenType.access,
        deviceInfo: data.deviceInfo,
        expiredAt: moment(tokens.accessToken.payload.exp).format(),
      });
    } catch (err) {
      throw new ServerError('Failed to register access token', err);
    }

    // register refresh token
    try {
      await knex('tokens').insert({
        id: tokens.refreshToken.payload.id,
        account: tokens.refreshToken.payload.uuid,
        type: TokenType.refresh,
        associated: tokens.accessToken.payload.id,
        deviceInfo: data.deviceInfo,
        expiredAt: moment(tokens.refreshToken.payload.exp).format(),
      });
    } catch (err) {
      throw new ServerError('Failed to register refresh token', err);
    }

    logger.auth.info('New Access token was registered', tokens.accessToken.payload);

    return tokens;
  }

  public generateTokens(
    payload: Pick<ITokenInfo['payload'], 'uuid' | 'roles'>,
    exp?: {
      access: number;
      refresh: number;
    },
  ): ITokenPackage {
    const { context } = this.props;

    const accessExpires = exp?.access ? exp.access : context.jwt.accessTokenExpiresIn;
    const refreshExpires = exp?.refresh ? exp.refresh : context.jwt.refreshTokenExpiresIn;

    // check file to access and readable
    try {
      fs.accessSync(context.jwt.privateKey);
    } catch (err) {
      throw new ServerError('Failed to open JWT privateKey file', { err });
    }

    const privatKey = fs.readFileSync(context.jwt.privateKey);

    const accessTokenPayload = {
      ...payload,
      type: TokenType.access,
      id: uuidv4(),
      exp: Math.floor(Date.now() / 1000) + Number(accessExpires),
      iss: context.jwt.issuer,
    };

    const refreshTokenPayload = {
      ...payload,
      type: TokenType.refresh,
      id: uuidv4(),
      associated: accessTokenPayload.id,
      exp: Math.floor(Date.now() / 1000) + Number(refreshExpires),
      iss: context.jwt.issuer,
    };

    const accessToken = jwt.sign(accessTokenPayload, privatKey, {
      algorithm: context.jwt.algorithm,
    });

    const refreshToken = jwt.sign(refreshTokenPayload, privatKey, {
      algorithm: context.jwt.algorithm,
    });

    return {
      accessToken: {
        token: accessToken,
        payload: {
          ...accessTokenPayload,
          type: TokenType.access,
        },
      },
      refreshToken: {
        token: refreshToken,
        payload: {
          ...refreshTokenPayload,
          type: TokenType.refresh,
        },
      },
    };
  }

  public async revokeToken(tokenId: string) {
    const { context } = this.props;
    const { knex } = context;

    await knex.del('tokens').where({
      id: tokenId,
    });
  }

  /**
   * Extract Token from HTTP request headers
   * @param  {Request} request
   * @returns string
   */
  public static extractToken(request: Request): string {
    const { headers } = request;

    if (TOKEN_AUTHORIZATION_KEY.toLocaleLowerCase() in headers) {
      const [bearer, tokenFromHeader] = String(headers[TOKEN_AUTHORIZATION_KEY.toLocaleLowerCase()]).split(' ');

      if (bearer === TOKEN_BEARER && tokenFromHeader !== '') {
        return String(tokenFromHeader);
      }
    }

    if (TOKEN_AUTHORIZATION_KEY in request.signedCookies) {
      return String(request.signedCookies[TOKEN_AUTHORIZATION_KEY]);
    }

    return '';
  }

  public async checkTokenExist(tokenId: string): Promise<boolean> {
    const { context } = this.props;
    const { knex } = context;

    const tokenData = await knex
      .select(['id'])
      .from('tokens')
      .where({ id: tokenId })
      .first();

    return tokenData !== null;
  }

  public async getAccountByLogin(login: IAccount['login'], password?: string): AccountByLoginResponse {
    const { context } = this.props;
    const { knex } = context;

    const account = await knex
      .select<any, Pick<IAccount, 'id' | 'password' | 'status' | 'roles'>>(['id', 'password', 'status', 'roles'])
      .from('accounts')
      .where({
        login,
      })
      .first();

    // check account exist
    if (typeof account === 'undefined') {
      return {
        error: ResponseErrorType.accountNotFound,
        account: false,
      };
    }

    // compare bcrypt password
    if (typeof password === 'string') {
      if (!bcryptjs.compareSync(password, account.password)) {
        return {
          error: ResponseErrorType.invalidLoginOrPassword,
          account: false,
        };
      }
    }

    // check status
    if (account.status === AccountStatus.forbidden) {
      return {
        error: ResponseErrorType.accountForbidden,
        account: false,
      };
    }

    // if success
    return {
      account: {
        id: account.id,
        password: account.password,
        status: account.status,
        roles: account.roles,
      },
    };
  }

  public static sendResponseError(responsetype: ResponseErrorType, resp: Response) {
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
      case 'isNotARefreshToken':
        errors.push({
          message: 'Token error',
          name: 'Is not a refresh token',
        });
        break;
      case 'isNotAnAccessToken':
        errors.push({
          message: 'Token error',
          name: 'Is not a access token',
        });
        break;
      case 'tokenExpired':
        errors.push({
          message: 'Token error',
          name: 'This token expired',
        });
        break;
      case 'tokenWasRevoked':
        errors.push({
          message: 'Token error',
          name: 'Token was revoked',
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

  public getAccounts(filter: IKnexFilterDefaults): Promise<IListResponse<IAccount>> {
    const { context } = this.props;
    const { knex } = context;
    const { limit, orderBy, where } = filter;

    return knex
      .select<any, Array<IAccount & { totalCount: number }>>(['j.totalCount', 'accounts.*'])
      .join(
        knex('accounts')
          .select(['id', knex.raw('count(*) over() as "totalCount"')])
          .orderBy(orderBy)
          .limit(limit)
          .where(where)
          .as('j'),
        'j.id',
        'accounts.id',
      )
      .orderBy(orderBy)
      .from('accounts')
      .then(nodes => {
        return {
          totalCount: nodes.length ? nodes[0].totalCount : 0,
          nodes,
          limit,
        };
      });
  }
}

interface IProps {
  context: IContext;
}

export type AccountByLoginResponse = Promise<{
  error?: ResponseErrorType;
  account: Pick<IAccount, 'id' | 'password' | 'status' | 'roles'> | false;
}>;

/**
 * @see: JWT configuration. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
 */
export interface IJwtConfig extends Pick<SignOptions, 'algorithm' | 'issuer'> {
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  /**
   * Cert private key file path
   */
  privateKey: string;
  /**
   * Cert public key file path
   */
  publicKey: string;
}

export type ITokenInfo = IAccessToken | IRefreshToken;

export interface ITokenPackage {
  accessToken: ITokenInfo;
  refreshToken: ITokenInfo;
}

export interface IAccessToken {
  token: string;
  payload: {
    /**
     * Token type (only for internal identify)
     */
    type: TokenType.access;
    /**
     * Token ID
     */
    id: string;

    /**
     * Account ID
     */
    uuid: string;

    /**
     * Account roles array
     */
    roles: string[];
    exp: number;
    iss: string;
  };
}

interface IRefreshToken {
  token: string;
  payload: Omit<IAccessToken['payload'], 'type'> & {
    /**
     * Token type (only for internal identify)
     */
    type: TokenType.refresh;

    /**
     * Access token ID associated value
     */
    associated: string;
  };
}

export interface IResponseError {
  name: string;
  message: string;
}

export interface IAccount {
  id: string;
  login: string;
  password: string;
  status: AccountStatus;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  cursor: number;
}
