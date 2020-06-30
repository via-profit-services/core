import { Request } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { IContext } from '../../types';
import { IAccount, IAccountRole } from './types';
export declare enum TokenType {
    access = "access",
    refresh = "refresh"
}
export default class AuthService {
    private props;
    constructor(props: Props);
    /**
     * Crypt password string by bcryptjs
     * @param  {string} password
     * @returns password hash
     */
    static cryptUserPassword(password: string): string;
    getAccountByCredentials(login: string, password: string): Promise<Pick<IAccount, 'id' | 'roles'>>;
    /**
     * Register tokens
     * @param  {{uuid:string;deviceInfo:{};}} data
     * @returns ITokenInfo
     */
    registerTokens(data: {
        uuid: string;
        deviceInfo?: {};
    }): Promise<ITokenPackage>;
    generateTokens(payload: Pick<ITokenInfo['payload'], 'uuid' | 'roles'>, exp?: {
        access: number;
        refresh: number;
    }): ITokenPackage;
    revokeToken(accessTokenIdOrIds: string | string[]): Promise<void>;
    isTokenRevoked(accessTokenId: string): Promise<boolean>;
    revokeAccountTokens(accountId: string): Promise<string[]>;
    getTokensByIds(ids: string[]): Promise<any[]>;
    clearExpiredTokens(): Promise<void>;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): Promise<ITokenInfo['payload'] | false>;
    checkTokenExist(tokenId: string): Promise<boolean>;
    static extractTokenFromSubscription(connectionParams: any): string;
    /**
     * Extract Token from HTTP request headers
     * @param  {TokenType} tokenType
     * @param  {Request} request
     * @returns string
     */
    static extractToken(tokenType: TokenType, request: Request): string;
}
interface Props {
    context: Pick<IContext, 'knex' | 'logger' | 'redis' | 'jwt'>;
}
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
export declare type ITokenInfo = IAccessToken | IRefreshToken;
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
        roles: IAccountRole[];
        exp: number;
        iss: string;
    };
}
export interface IRefreshToken {
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
export declare type ITokensBackList = string[];
export {};
