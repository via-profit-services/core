import zlib from 'node:zlib';
import http from 'node:http';
import type { BodyParser, RequestBody, Configuration } from '@via-profit-services/core';

import graphqlFileUploader from './graphql-file-uploader';
import parseContentType from './content-type-parser';
import { DEFAULT_JSON_DECOMPRESSED_MAX_BYTES, DEFAULT_JSON_MAX_BYTES } from '../constants';
import { HttpError } from './http-error';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Main body parser entry point.
 * Handles:
 *   - multipart/form-data (file uploads)
 *   - JSON bodies
 *   - gzip/deflate/br decompression
 *   - size limits
 *
 * Returns `{}` for an empty body (GET requests). A non-empty body must be a
 * JSON object, otherwise an error is thrown: silently ignoring a broken body
 * turns a client bug into a confusing "the request is empty" error.
 */
const bodyParser: BodyParser = async ({ request, response, config }) => {
  const { method, headers } = request;

  // POST without content-type is invalid
  if (method === 'POST' && typeof headers['content-type'] === 'undefined') {
    throw new HttpError('Missing Content-Type header', 415);
  }

  // Multipart (file upload). Media types are case-insensitive
  if (parseContentType(String(headers['content-type'] || ''))?.type === 'multipart/form-data') {
    return graphqlFileUploader({ request, response, config });
  }

  const rawBody = await readBody(request, {
    maxJSONBodySize: config.limits?.maxJSONBodySize || DEFAULT_JSON_MAX_BYTES,
    maxDecompressedSize:
      config.limits?.maxJSONBodyDecompressedSize || DEFAULT_JSON_DECOMPRESSED_MAX_BYTES,
  });

  if (rawBody.trim() === '') {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch (err) {
    throw new HttpError(
      `Failed to parse GraphQL query. The request body is not valid JSON: ${err instanceof Error ? err.message : ''}`,
    );
  }

  if (Array.isArray(parsed)) {
    throw new HttpError('Batched operations are not supported');
  }

  if (!isPlainObject(parsed)) {
    throw new HttpError('The request body must be a JSON object');
  }

  return parsed as RequestBody;
};

interface GraphQLParams {
  query: string;
  variables: { readonly [key: string]: unknown } | null;
  operationName: string | null;
  /** true if the query text was taken from the persisted queries map */
  persisted: boolean;
}

interface GraphQLParamsProps {
  body: RequestBody;
  request: http.IncomingMessage;
  config: Configuration;
}

/**
 * Extracts GraphQL parameters from:
 *   - query string
 *   - request body
 *   - persisted queries
 */
export const parseGraphQLParams = (props: GraphQLParamsProps): GraphQLParams => {
  const { body, request, config } = props;
  const { persistedQueriesMap, persistedQueryKey } = config;
  const url = request.url || '';
  const queryIndex = url.indexOf('?');
  const urlData = new URLSearchParams(queryIndex === -1 ? '' : url.slice(queryIndex + 1));

  const graphQLParams: GraphQLParams = {
    query: '',
    variables: null,
    operationName: null,
    persisted: false,
  };

  //
  // Persisted query support
  //
  const persistedKey = persistedQueryKey
    ? urlData.get(persistedQueryKey) || body[persistedQueryKey]
    : undefined;
  if (
    typeof persistedKey === 'string' &&
    persistedQueriesMap &&
    Object.prototype.hasOwnProperty.call(persistedQueriesMap, persistedKey)
  ) {
    const mappedQuery = persistedQueriesMap[persistedKey];
    if (typeof mappedQuery === 'string') {
      graphQLParams.query = mappedQuery;
      graphQLParams.persisted = true;
    }
  }

  //
  // Query from URL or body
  //
  if (!graphQLParams.query) {
    const query = urlData.get('query') ?? body.query;
    graphQLParams.query = typeof query === 'string' ? query : '';
  }

  //
  // Variables: an object, a JSON string of an object (GET), or nothing
  //
  let variables: unknown = urlData.get('variables') ?? body.variables;

  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch {
      throw new HttpError('Variables are invalid JSON.');
    }
  }

  if (typeof variables !== 'undefined' && variables !== null) {
    if (!isPlainObject(variables)) {
      throw new HttpError('Variables must be an object.');
    }

    graphQLParams.variables = { ...variables };
  }

  //
  // Operation name
  //
  const operationName = urlData.get('operationName') ?? body.operationName;
  if (typeof operationName === 'string') {
    graphQLParams.operationName = operationName;
  }

  return graphQLParams;
};

/**
 * Decompression stream for a Content-Encoding.
 */
const createDecoder = (encoding: string) => {
  switch (encoding) {
    case 'identity':
      return null;

    case 'deflate':
      return zlib.createInflate();

    case 'gzip':
    case 'x-gzip':
      return zlib.createGunzip();

    case 'br':
      return zlib.createBrotliDecompress();

    default:
      // RFC 9110: an unsupported content coding is 415
      throw new HttpError(`Unsupported content-encoding "${encoding}".`, 415);
  }
};

type ReadBodyOptions = {
  readonly maxJSONBodySize: number;
  readonly maxDecompressedSize: number;
};

/**
 * Reads and optionally decompresses the request body.
 * Enforces:
 *   - max body size on the wire (compressed size)
 *   - max decompressed size (protects from gzip bombs)
 *
 * Errors of the request and of the decoder are both handled: with a bare
 * `pipe` an aborted request or a broken gzip stream would leave the promise
 * pending forever. `stream.pipeline` is not used on purpose: on error it
 * destroys the request and its socket, so the client would get a connection
 * reset instead of an error response.
 */
const readBody = (request: http.IncomingMessage, opts: ReadBodyOptions): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const { maxJSONBodySize, maxDecompressedSize } = opts;
    const contentEncoding = request.headers['content-encoding'];
    const encoding =
      typeof contentEncoding === 'string' ? contentEncoding.trim().toLowerCase() : 'identity';

    const contentLength = Number(request.headers['content-length']);
    if (Number.isFinite(contentLength) && contentLength > maxJSONBodySize) {
      reject(
        new HttpError(
          `Request body exceeds maximum allowed size of ${maxJSONBodySize} bytes.`,
          413,
        ),
      );

      return;
    }

    let decoder: zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress | null;
    try {
      decoder = createDecoder(encoding);
    } catch (err) {
      reject(err);

      return;
    }

    const chunks: Buffer[] = [];
    let wireSize = 0;
    let decodedSize = 0;
    let settled = false;

    const fail = (err: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      // stop reading and decoding; the socket stays open for the response
      if (decoder) {
        request.unpipe(decoder);
        decoder.destroy();
      }
      request.pause();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    request.on('data', (chunk: Buffer) => {
      wireSize += chunk.length;
      if (wireSize > maxJSONBodySize) {
        fail(
          new HttpError(
            `Request body exceeds maximum allowed size of ${maxJSONBodySize} bytes.`,
            413,
          ),
        );
      }
    });

    const source = decoder ? request.pipe(decoder) : request;

    source.on('data', (chunk: Buffer) => {
      if (settled) {
        return;
      }

      decodedSize += chunk.length;
      // Only for an encoded body: an identity body is limited by maxJSONBodySize,
      // and maxJSONBodySize above maxJSONBodyDecompressedSize must take effect
      if (decoder && decodedSize > maxDecompressedSize) {
        fail(
          new HttpError(
            `Decompressed body exceeds maximum allowed size of ${maxDecompressedSize} bytes.`,
            413,
          ),
        );

        return;
      }

      chunks.push(chunk);
    });

    source.once('end', () => {
      if (!settled) {
        settled = true;
        resolve(Buffer.concat(chunks).toString('utf8'));
      }
    });

    request.once('error', err => fail(new HttpError(`Failed to read body: ${err.message}`)));
    decoder?.once('error', err => fail(new HttpError(`Failed to read body: ${err.message}`)));
    request.once('close', () => {
      if (!request.readableEnded) {
        fail(new HttpError('Failed to read body: the request was aborted'));
      }
    });
  });

export default bodyParser;
