import fs from 'fs';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import moment from 'moment-timezone';
import uuidv4 from 'uuid/v4';
import { IContext } from '~/app';
import { ServerError, UnauthorizedError } from '~/logger/errorHandlers';

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}

export class Authentificator {
  private props: IProps;

  public constructor(props: IProps) {
    this.props = props;
  }

  /**
   * Extract Token from HTTP request headers
   * @param  {Request} request
   * @returns string
   */
  public static extractToken(request: Request): string | undefined {
    const { headers } = request;
    const { authorization } = headers;
    const bearer = String(authorization).split(' ')[0];
    const token = String(authorization).split(' ')[1];
    return bearer.toLocaleLowerCase() === 'bearer' ? token : '';
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

  public async getAccountByLogin(login: IAccount['login']): Promise<Pick<IAccount, 'id' | 'password' | 'status'>> {
    const { context } = this.props;
    const { knex } = context;

    const account = await knex
      .select<any, Pick<IAccount, 'id' | 'password' | 'status'>>(['id', 'password', 'status'])
      .from('accounts')
      .where({
        login,
      })
      .first();

    return {
      id: account.id,
      password: account.password,
      status: account.status,
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

  public getAccounts(filter: IAccountsFilter): Promise<IAccountsListResponse> {
    const { context } = this.props;
    const { knex, timezone } = context;

    const responseData: IAccountsListResponse = {
      totalCount: 0,
      nodes: [],
    };

    const query = knex
      .select<any, Array<IAccount & { totalCount: number }>>(['j.totalCount', 'accounts.*'])
      .join(
        knex('accounts')
          .select(['id', knex.raw('count(*) over() as "totalCount"')])
          .orderBy(filter.orderBy)
          .limit(filter.limit)
          .where(handle => {
            if (filter.after !== undefined) {
              handle.where('cursor', '>', Number(filter.after));
            }
            if (filter.before !== undefined) {
              handle.where('cursor', '<', Number(filter.before));
            }

            if (filter.where !== undefined) {
              handle.where(filter.where);
            }
          })
          .as('j'),
        'j.id',
        'accounts.id',
      )
      .orderBy(filter.orderBy)
      .from('accounts')
      .then(nodes => {
        return nodes.map(node => {
          const { totalCount, ...nodeData } = node;
          responseData.totalCount = totalCount;
          return {
            ...nodeData,
            createdAt: moment.tz(nodeData.createdAt, timezone).format(),
            updatedAt: moment.tz(nodeData.updatedAt, timezone).format(),
          };
        });
      })
      .then(nodes => {
        responseData.totalCount = Number(responseData.totalCount);
        responseData.nodes = nodes;

        return responseData;
      });

    return query;
  }
}

interface IProps {
  context: IContext;
}

export interface IAccountsListResponse {
  totalCount: number;
  nodes: IAccount[];
}

export enum OrderRange {
  asc = 'asc',
  desc = 'desc',
}

export interface IAccountsFilter {
  limit: number;
  after?: number;
  before?: number;
  where?: {
    status?: AccountStatus;
  };
  orderBy: [
    {
      column: string;
      order: OrderRange;
    },
  ];
}

/**
 * @see: JWT configuration. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
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

export type ITokenInfo = IAccessToken | IRefreshToken;

export interface ITokenPackage {
  accessToken: ITokenInfo;
  refreshToken: ITokenInfo;
}

export interface IAccessToken {
  token: string;
  payload: {
    type: TokenType.access;
    uuid: string;
    id: string;
    roles: string[];
    exp: number;
    iss: string;
  };
}

export interface IRefreshToken {
  token: string;
  payload: {
    type: TokenType.refresh;
    uuid: string;
    id: string;
    roles: string[];
    associated: string;
    exp: number;
    iss: string;
  };
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

export interface IResponseError {
  name: string;
  message: string;
}

export enum AccountStatus {
  allowed = 'allowed',
  forbidden = 'forbidden',
}

export interface IAccount {
  id: string;
  login: string;
  password: string;
  status: AccountStatus;
  roles: string[];
  cursor: number;
  createdAt: string;
  updatedAt: string;
}
