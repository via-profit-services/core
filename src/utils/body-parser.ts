import zlib from 'node:zlib';
import http from 'node:http';
import type { BodyParser, RequestBody, Configuration } from '@via-profit-services/core';

import multipartParser from './multipart-parser';
import {  } from 'constants';
import { DEFAULT_JSON_DECOMPRESSED_MAX_BYTES, DEFAULT_JSON_MAX_BYTES } from '../constants';

const JSONOBJREGEX = /^[ \t\n\r]*\{/;

/**
 * Main body parser entry point.
 * Handles:
 *   - multipart/form-data (file uploads)
 *   - JSON bodies
 *   - gzip/deflate decompression
 *   - size limits
 */
const bodyParser: BodyParser = async ({ request, response, config }) => {
  const { method, headers } = request;

  // POST without content-type is invalid
  if (method === 'POST' && typeof headers['content-type'] === 'undefined') {
    throw new Error('Missing Content-Type header');
  }

  // Multipart (file upload)
  if (headers['content-type']?.startsWith('multipart/form-data')) {
    try {
      return await multipartParser({ request, response, config });
    } catch (err) {
      // Preserve original error
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  // JSON or other text body
  const rawBody = await readBody(request, {
    charset: 'utf-8',
    maxJSONBodySize: config.limits?.maxJSONBodySize || DEFAULT_JSON_MAX_BYTES,
    maxDecompressedSize: config.limits?.maxJSONBodyDecompressedSize || DEFAULT_JSON_DECOMPRESSED_MAX_BYTES,
  });

  // Try to parse JSON only if it looks like JSON
  if (JSONOBJREGEX.test(rawBody)) {
    try {
      return JSON.parse(rawBody);
    } catch {
      // Invalid JSON — return empty object
    }
  }

  return {};
};

interface GraphQLParams {
  query: string;
  variables: { readonly [key: string]: unknown } | null;
  operationName: string | null;
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

  const urlData = new URLSearchParams(url.split('?')[1]);

  const graphQLParams: GraphQLParams = {
    query: '',
    variables: null,
    operationName: null,
  };

  //
  // Persisted query support
  //
  const persistedKey = persistedQueryKey ? urlData.get(persistedQueryKey) || body[persistedQueryKey] : undefined;
  if (typeof persistedKey === 'string') {
    const mappedQuery = persistedQueriesMap ? persistedQueriesMap[persistedKey] : undefined;
    if (typeof mappedQuery === 'string') {
      graphQLParams.query = mappedQuery;
    }
  }

  //
  // Query from URL or body
  //
  if (!graphQLParams.query) {
    graphQLParams.query = urlData.get('query') ?? String(body.query || '');
  }

  //
  // Variables
  //
  const variables = urlData.get('variables') ?? body.variables;

  if (typeof variables === 'string') {
    try {
      graphQLParams.variables = JSON.parse(variables);
    } catch {
      throw new Error('Variables are invalid JSON.');
    }
  } else if (typeof variables === 'object' && variables !== null) {
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
 * Decompresses request body stream based on Content-Encoding.
 */
const decompressBody = (request: http.IncomingMessage, encoding: string) => {
  switch (encoding) {
    case 'identity':
      return request;

    case 'deflate':
      return request.pipe(zlib.createInflate());

    case 'gzip':
      return request.pipe(zlib.createGunzip());

    default:
      throw new Error(`Unsupported content-encoding "${encoding}".`);
  }
};

type ReadBodyOptions = {
  readonly charset: BufferEncoding;
  readonly maxJSONBodySize: number;
  readonly maxDecompressedSize: number;
};

/**
 * Reads and optionally decompresses the request body.
 * Enforces:
 *   - max JSON body size
 *   - max decompressed size
 */
const readBody = async (
  request: http.IncomingMessage,
  opts: ReadBodyOptions,
): Promise<string> => {
  const { charset, maxJSONBodySize, maxDecompressedSize } = opts;

  if (!charset.startsWith('utf-')) {
    throw new Error(`Unsupported charset "${charset.toUpperCase()}".`);
  }

  const contentEncoding = request.headers['content-encoding'];
  const encoding = typeof contentEncoding === 'string' ? contentEncoding.toLowerCase() : 'identity';

  const contentLengthHeader = request.headers['content-length'];
  const contentLength =
    encoding === 'identity' && typeof contentLengthHeader === 'string'
      ? Number(contentLengthHeader)
      : null;

  if (contentLength !== null && contentLength > maxJSONBodySize) {
    throw new Error(`Request body exceeds maximum allowed size of ${maxJSONBodySize} bytes.`);
  }

  const stream = decompressBody(request, encoding);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;

    stream.on('data', chunk => {
      received += chunk.length;

      if (received > maxDecompressedSize) {
        reject(
          new Error(
            `Decompressed body exceeds maximum allowed size of ${maxDecompressedSize} bytes.`,
          ),
        );
        stream.destroy();
        return;
      }

      chunks.push(chunk);
    });

    stream.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);

        if (encoding === 'identity' && buffer.length > maxJSONBodySize) {
          return reject(
            new Error(`Request body exceeds maximum allowed size of ${maxJSONBodySize} bytes.`),
          );
        }

        resolve(buffer.toString(charset));
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });

    stream.on('error', err => {
      reject(new Error(`Failed to read body: ${err instanceof Error ? err.message : err}`));
    });
  });
};

export default bodyParser;
