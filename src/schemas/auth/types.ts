import { SignOptions } from 'jsonwebtoken';

export enum AccountStatus {
  allowed = 'allowed',
  forbidden = 'forbidden',
}

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}

export type IAccountRole = string;

export interface IAccount {
  id: string;
  name: string;
  login: string;
  password: string;
  status: AccountStatus;
  roles: IAccountRole[];
  createdAt: Date;
  updatedAt: Date;
  deleted: Boolean;
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

export type ITokensBackList = string[];
