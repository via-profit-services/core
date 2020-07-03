/* eslint-disable import/max-dependencies */
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { ServerError, BadRequestError } from '../../errorHandlers';
import { IContext } from '../../types';
import {
  TOKEN_BEARER_KEY,
  TOKEN_BEARER,
  REDIS_TOKENS_BLACKLIST,
} from '../../utils';
import {
  IAccount, AccountStatus, TokenType, ITokenPackage, ITokenInfo,
} from './types';


export default class AuthService {
  private props: Props;

  public constructor(props: Props) {
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

  public async getAccountByCredentials(login: string, password: string): Promise<Pick<IAccount, 'id' | 'roles'>> {
    const { context } = this.props;
    const { knex } = context;

    const account = await knex
      .select<any, Pick<IAccount, 'id' | 'password' | 'status' | 'roles'>>(['id', 'password', 'status', 'roles'])
      .from('accounts')
      .where({
        login,
      })
      .first();

    if (!account || !bcryptjs.compareSync(password, String(account.password))) {
      throw new BadRequestError('Invalid login or password');
    }

    if (account.status === AccountStatus.forbidden) {
      throw new BadRequestError('Account locked');
    }

    return account;
  }

  /**
   * Register tokens
   * @param  {{uuid:string;deviceInfo:{};}} data
   * @returns ITokenInfo
   */
  public async registerTokens(data: { uuid: string; deviceInfo?: {} }): Promise<ITokenPackage> {
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
      throw new BadRequestError(`Account with id[${account.id}] not found`);
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
        expiredAt: moment(tokens.accessToken.payload.exp * 1000).format(),
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
        expiredAt: moment(tokens.refreshToken.payload.exp * 1000).format(),
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


  public async revokeToken(accessTokenIdOrIds: string | string[]) {
    const { context } = this.props;
    const { logger, knex, redis } = context;

    const ids = Array.isArray(accessTokenIdOrIds) ? accessTokenIdOrIds : [accessTokenIdOrIds];

    try {
      redis.sadd(REDIS_TOKENS_BLACKLIST, ids);
      logger.auth.info('New tokens has been added in BlackList', { tokenIds: ids });
    } catch (err) {
      throw new ServerError('Failed to update Redis BlackList', { err });
    }

    const tokensList = await knex('tokens')
      .select(['tokens.account', 'tokens.id as access', 'refreshTokens.id as refresh'])
      .leftJoin('accounts', 'accounts.id', 'tokens.account')
      .leftJoin('tokens as refreshTokens', 'refreshTokens.associated', 'tokens.id')
      .whereIn('tokens.id', ids);

    tokensList.forEach((data: {
      account: string;
      access: string;
      refresh: string;
    }) => {
      logger.auth.info(`Revoke Access Token ${data.access} for account ${data.account}`, { data });
      logger.auth.info(`Revoke Refresh Token ${data.refresh} for account ${data.account}`, { data });
    });
  }

  public async isTokenRevoked(accessTokenId: string): Promise<boolean> {
    const { redis, logger } = this.props.context;

    try {
      const result = await redis.sismember(REDIS_TOKENS_BLACKLIST, accessTokenId);
      return Boolean(result);
    } catch (err) {
      logger.server.error('Redis sismember error', { err });
      throw new ServerError('Failed to check token', { err });
    }
  }

  public async revokeAccountTokens(account: string): Promise<string[]> {
    const { knex } = this.props.context;

    const allTokens = await knex('tokens')
      .select(['id'])
      .where({ account });

    const ids = allTokens.map((token: { id: string }) => token.id);

    if (ids.length) {
      await this.revokeToken(ids);
    }

    return ids;
  }


  public async getTokensByIds(ids: string[]) {
    const { context } = this.props;
    const { knex } = context;

    const result = await knex('tokens')
      .select('*')
      .whereIn('id', ids);

    return result;
  }

  public async clearExpiredTokens() {
    const { context } = this.props;
    const { knex, redis, logger } = context;

    const tokensList = await knex('tokens')
      .select('id')
      .where('expiredAt', '<', knex.raw('now()'));

    const expiredIds = tokensList.map((data: {id: string}) => data.id);

    if (expiredIds.length) {
      try {
        await redis.srem(REDIS_TOKENS_BLACKLIST, expiredIds);
      } catch (err) {
        logger.server.error('Redis srem error', { erro });
        throw new ServerError('Failed to remove data from BlackList', { err });
      }
    }

    await knex('tokens')
      .del()
      .where('expiredAt', '<', knex.raw('now()'));
  }

  /**
   * Verify JWT token
   */
  public async verifyToken(token: string): Promise<ITokenInfo['payload'] | false> {
    const { context } = this.props;
    const { redis, logger } = context;

    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(context.jwt.publicKey);
    } catch (err) {
      logger.server.error('Failed to read JWT key', { err });
      throw new ServerError('Failed to read JWT key', err);
    }

    try {
      const payload = jwt.verify(String(token), privateKey) as ITokenInfo['payload'];
      const revokeStatus = await redis.sismember(REDIS_TOKENS_BLACKLIST, payload.id);

      if (revokeStatus) {
        logger.auth.info('Token was revoked', { payload });
        return false;
      }

      return payload;
    } catch (err) {
      logger.server.error('Failed to validate the token', { err });
      return false;
    }
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

  public static extractTokenFromSubscription(connectionParams: any): string {
    if (typeof connectionParams === 'object' && TOKEN_BEARER_KEY in connectionParams) {
      const [bearer, token] = String(connectionParams[TOKEN_BEARER_KEY]).split(' ');

      if (bearer === TOKEN_BEARER && token !== '') {
        return String(token);
      }
    }

    return '';
  }

  /**
   * Extract Token from HTTP request headers
   * @param  {TokenType} tokenType
   * @param  {Request} request
   * @returns string
   */
  public static extractToken(tokenType: TokenType, request: Request): string {
    const { headers } = request;

    // Access token
    if (tokenType === TokenType.access) {
      // try to get access token from headers
      if (TOKEN_BEARER_KEY.toLocaleLowerCase() in headers) {
        const [bearer, tokenFromHeader] = String(headers[TOKEN_BEARER_KEY.toLocaleLowerCase()]).split(' ');

        if (bearer === TOKEN_BEARER && tokenFromHeader !== '') {
          return String(tokenFromHeader);
        }
      }
    }

    return '';
  }
}


interface Props {
  context: Pick<IContext, 'knex' | 'logger' | 'redis' | 'jwt'>;
}
