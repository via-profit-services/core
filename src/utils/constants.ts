export const TOKEN_BEARER_KEY = 'Authorization';
export const TOKEN_BEARER = 'Bearer';
export const REDIS_TOKENS_BLACKLIST = 'tokensBlackList';
export const REDIS_IP_BLACKLIST = 'ipBlackList';

export const DATABASE_CHARSET = 'UTF8';
export const DATABASE_CLIENT = 'pg';

export const DEFAULT_SERVER_PORT = 4000;
export const DEFAULT_GRAPHQL_ENDPOINT = '/graphql';
export const DEFAULT_AUTH_ENDPOINT = '/auth';
export const DEFAULT_GRAPHQL_SUBSCRIPTION_ENDPOINT = '/subscriptions';
export const DEFAULT_SERVER_TIMEZONE = 'UTC';
export const DEFAULT_SESSION_SECRET = 'DCBUN0HUKGY4WGHAK5446GAJDFHSKA';
export const DEFAULT_SESSION_TTL = 3600;
export const DEFAULT_SESSION_PATH = './sessions';
export const DEFAULT_INTROSPECTION_STATE = false;

export const MAXIMUM_REQUEST_BODY_SIZE = '50mb';

export const DEV_INFO_DEVELOPER_NAME = 'Via Profit';
export const DEV_INFO_DEVELOPER_URL = 'https://via-profit.ru/';
export const DEV_INFO_DEVELOPER_EMAIL = 'promo@via-profit.ru';

export const LOG_FILENAME_AUTH = 'auth-%DATE%.log';
export const LOG_FILENAME_HTTP = 'http-%DATE%.log';
export const LOG_FILENAME_DEBUG = 'debug-%DATE%.log';
export const LOG_FILENAME_ERRORS = 'errors-%DATE%.log';
export const LOG_FILENAME_WARNINGS = 'warnings-%DATE%.log';
export const LOG_FILENAME_SQL = 'sql-%DATE%.log';
export const LOG_FILENAME_ACCESS = 'access-%DATE%.log';
export const LOG_FILENAME_SESSIONS = 'sessions-%DATE%.log';
export const LOG_DATE_PATTERNT = 'YYYY-MM-DD';
export const LOG_MAX_SIZE = '20m';
export const LOG_MAX_FILES = '14d';

/** Depricated */
export const LOG_MAZ_FILES = '14d';

/** Depricated */
export const LOG_MAZ_SIZE = '20m';
