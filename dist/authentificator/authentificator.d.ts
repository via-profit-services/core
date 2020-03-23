import { Request, Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { IContext } from '../app';
import { IListResponse, IKnexFilterDefaults } from '../utils/generateCursorBundle';
export declare enum TokenType {
    access = "access",
    refresh = "refresh"
}
export declare enum AccountStatus {
    allowed = "allowed",
    forbidden = "forbidden"
}
export declare enum ResponseErrorType {
    authentificationRequired = "authentificationRequired",
    accountNotFound = "accountNotFound",
    accountForbidden = "accountForbidden",
    invalidLoginOrPassword = "invalidLoginOrPassword",
    tokenExpired = "tokenExpired",
    isNotAnAccessToken = "isNotAnAccessToken",
    isNotARefreshToken = "isNotARefreshToken",
    tokenWasRevoked = "tokenWasRevoked"
}
export declare class Authentificator {
    private props;
    constructor(props: IProps);
    /**
     * Crypt password string by bcryptjs
     * @param  {string} password
     * @returns password hash
     */
    static cryptUserPassword(password: string): string;
    /**
     * Verify JWT token
     * @param  {string} token
     * @param  {string} publicKeyPath
     * @returns ITokenInfo['payload']
     */
    static verifyToken(token: string, publicKeyPath: string): ITokenInfo['payload'];
    /**
     * Register tokens
     * @param  {{id:string;deviceInfo:{};}} data
     * @returns ITokenInfo
     */
    registerTokens(data: {
        id: string;
        deviceInfo: {};
    }): Promise<ITokenPackage>;
    generateTokens(payload: Pick<ITokenInfo['payload'], 'id' | 'roles'>, exp?: {
        access: number;
        refresh: number;
    }): ITokenPackage;
    revokeToken(tokenId: string): Promise<void>;
    /**
     * Extract Token from HTTP request headers
     * @param  {Request} request
     * @returns string
     */
    static extractToken(request: Request): string;
    checkTokenExist(tokenId: string): Promise<boolean>;
    getAccountByLogin(login: IAccount['login'], password?: string): AccountByLoginResponse;
    static sendResponseError(responsetype: ResponseErrorType, resp: Response): Response;
    getAccounts(filter: IKnexFilterDefaults): Promise<IListResponse<IAccount>>;
}
interface IProps {
    context: IContext;
}
export declare type AccountByLoginResponse = Promise<{
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
export declare type ITokenInfo = IAccessToken | IRefreshToken;
export interface ITokenPackage {
    accessToken: ITokenInfo;
    refreshToken: ITokenInfo;
}
export interface IAccessToken {
    token: string;
    payload: {
        type: TokenType.access;
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
        id: string;
        roles: string[];
        associated: string;
        exp: number;
        iss: string;
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
export {};
