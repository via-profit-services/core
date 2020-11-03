import { Request } from 'express';
import { IContext } from '../../types';
import { IAccount, TokenType, ITokenPackage, ITokenInfo } from './types';
export default class AuthService {
    private props;
    constructor(props: Props);
    /**
     * Crypt password string by bcryptjs
     * @param  {string} password
     * @returns password hash
     */
    static cryptUserPassword(password: string): string;
    getAccountByCredentials(login: string, password: string): Promise<Pick<IAccount, 'id' | 'roles' | 'password' | 'status' | 'roles'> | null>;
    /**
     * Register tokens
     * @param  {{uuid:string;deviceInfo:{};}} data
     * @returns ITokenInfo
     */
    registerTokens(data: {
        uuid: string;
        deviceInfo?: any;
    }): Promise<ITokenPackage>;
    generateTokens(payload: Pick<ITokenInfo['payload'], 'uuid' | 'roles'>, exp?: {
        access: number;
        refresh: number;
    }): ITokenPackage;
    revokeToken(accessTokenIdOrIds: string | string[]): Promise<void>;
    isTokenRevoked(accessTokenId: string): Promise<boolean>;
    revokeAccountTokens(account: string): Promise<string[]>;
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
export {};
