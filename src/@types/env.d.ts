declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';

    PORT: string;

    GQL_ENDPOINT: string;

    DB_CLIENT: 'pg' | 'postgres';
    DB_HOST: string;
    DB_USER: string;
    DB_NAME: string;
    DB_PASSWORD: string;

    JWT_ALGORITHM:
    'HS256' | 'HS384' | 'HS512' |
    'RS256' | 'RS384' | 'RS512' |
    'ES256' | 'ES384' | 'ES512' |
    'PS256' | 'PS384' | 'PS512' |
    'none';
    JWT_ACCESSTOKENEXPIRESIN: string;
    JWT_REFRESHTOKENEXPIRESIN: string;
    JWT_ISSUER: string;
  }
}