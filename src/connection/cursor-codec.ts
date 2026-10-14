import crypto from 'node:crypto';
import { GraphQLError } from 'graphql';
import type { CursorCodec, CursorCodecOptions } from './types';

/**
 * HMAC-SHA256 key shorter than the hash output weakens the signature:
 * RFC 2104 recommends a key of at least the hash length (32 bytes)
 */
export const MIN_CURSOR_SECRET_LENGTH = 32;

export const invalidCursorError = () =>
  new GraphQLError('Invalid cursor', { extensions: { code: 'BAD_USER_INPUT' } });

/**
 * Signed cursors: `<base64url JSON payload>.<base64url HMAC-SHA256>`.
 *
 * Why a signature. A cursor comes back from the client, and a base64 cursor
 * is plain JSON for anyone: the client decodes it, changes the filters
 * (e.g. removes `client: [<own client>]`) and encodes it again. With the
 * signature the payload stays readable, but can not be changed without the
 * server key: any change gives «Invalid cursor».
 *
 * The secret is passed by the project. Do not use a password-like string
 * directly: derive a dedicated key, e.g. from the JWT key with HKDF:
 * `crypto.hkdfSync('sha256', jwtKey, '', 'connection-cursor', 32)`.
 *
 * Throws if the secret is shorter than 32 bytes.
 */
const createCursorCodec = (options: CursorCodecOptions): CursorCodec => {
  const key = Buffer.isBuffer(options?.secret)
    ? Buffer.from(options.secret)
    : Buffer.from(String(options?.secret ?? ''), 'utf8');

  if (key.length < MIN_CURSOR_SECRET_LENGTH) {
    throw new Error(
      `The cursor secret must be at least ${MIN_CURSOR_SECRET_LENGTH} bytes long. ` +
        'Derive it from a strong key, e.g. crypto.hkdfSync(\'sha256\', key, \'\', \'connection-cursor\', 32)',
    );
  }

  const sign = (data: string) => crypto.createHmac('sha256', key).update(data).digest('base64url');

  const encode = (payload: unknown) => {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');

    return `${data}.${sign(data)}`;
  };

  const decode = <Payload>(cursor: string): Payload => {
    const [data, signature, ...rest] = String(cursor).split('.');
    const expected = sign(data || '');

    // timingSafeEqual: comparison time does not tell how many characters matched
    if (
      !data ||
      !signature ||
      rest.length > 0 ||
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      throw invalidCursorError();
    }

    try {
      return JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as Payload;
    } catch {
      throw invalidCursorError();
    }
  };

  return { encode, decode };
};

export default createCursorCodec;
