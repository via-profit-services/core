import { Request, Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { IContext } from "../app";
export declare enum TokenType {
    access = "access",
    refresh = "refresh"
}
export declare class Authentificator {
    private props;
    constructor(props: IProps);
    /**
     * Extract Token from HTTP request headers
     * @param  {Request} request
     * @returns string
     */
    static extractToken(request: Request): string | undefined;
    /**
     * Verify JWT token
     * @param  {string} token
     * @param  {string} publicKeyPath
     * @returns ITokenInfo['payload']
     */
    static verifyToken(token: string, publicKeyPath: string): ITokenInfo['payload'];
    /**
     * Register tokens
     * @param  {{uuid:string;deviceInfo:{};}} data
     * @returns ITokenInfo
     */
    registerTokens(data: {
        uuid: string;
        deviceInfo: {};
    }): Promise<ITokenPackage>;
    generateTokens(payload: Pick<ITokenInfo['payload'], 'uuid' | 'roles'>, exp?: {
        access: number;
        refresh: number;
    }): ITokenPackage;
    revokeToken(tokenId: string): Promise<void>;
    checkTokenExist(tokenId: string): Promise<boolean>;
    getAccountByLogin(login: IAccount['login']): Promise<Pick<IAccount, 'id' | 'password' | 'status'>>;
    static sendResponseError(responsetype: ResponseErrorType, resp: Response): Response;
    getAccounts(filter: IAccountsFilter): Promise<IAccountsListResponse>;
}
interface IProps {
    context: IContext;
}
export interface IAccountsListResponse {
    totalCount: number;
    nodes: IAccount[];
}
export declare enum OrderRange {
    asc = "asc",
    desc = "desc"
}
export interface IAccountsFilter {
    limit: number;
    after?: number;
    before?: number;
    where?: {
        status?: AccountStatus;
    };
    orderBy: [{
        column: string;
        order: OrderRange;
    }];
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
export declare type ITokenInfo = IAccessToken | IRefreshToken;
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
export interface IResponseError {
    name: string;
    message: string;
}
export declare enum AccountStatus {
    allowed = "allowed",
    forbidden = "forbidden"
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
export {};
