import zlib from 'node:zlib';
import http from 'node:http';
import type { BodyParser, RequestBody, Configuration } from '@via-profit-services/core';
import getRawBody from 'raw-body';

import multipartParser from './multipart-parser';

const JSONOBJREGEX = /^[ \t\n\r]*\{/;

const bodyParser: BodyParser = async ({ request, response, config }) => {
  const { method, headers } = request;

  // Skip requests without content types.
  if (method === 'POST' && typeof headers['content-type'] === 'undefined') {
    throw new Error('Missing Content-Type header');
  }

  // check to multipart (file upload)
  if (headers['content-type']?.match(/^multipart\/form-data/)) {
    try {
      return await multipartParser({ request, response, config });
    } catch (err) {
      throw new Error(err);
    }
  }

  const rawBody = await readBody(request, { charset: 'utf-8' });

  if (JSONOBJREGEX.test(rawBody)) {
    try {
      return JSON.parse(rawBody);
    } catch {
      // Do nothing
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

export const parseGraphQLParams = (props: GraphQLParamsProps): GraphQLParams => {
  const { body, request, config } = props;
  const { persistedQueriesMap, persistedQueryKey } = config;
  const urlData = new URLSearchParams(request.url.split('?')[1]);

  const graphQLParams: GraphQLParams = {
    query: '',
    variables: null,
    operationName: null,
  };

  // if persistedQueryKey exits (in query string or body) then
  // try to get query by persisted queries
  if (urlData.get(persistedQueryKey) || typeof body[persistedQueryKey] === 'string') {
    const queryKey = urlData.get(persistedQueryKey) || body[persistedQueryKey];
    const mappedQuery = persistedQueriesMap[queryKey as string];

    if (typeof mappedQuery !== 'undefined') {
      graphQLParams.query = mappedQuery;
    }

    // if persistedQueryKey not exist
    // then try to get query from query string or bofy
  } else {
    graphQLParams.query = urlData.get('query') ?? String(body.query || '');
  }

  const variables = urlData.get('variables') ?? body.variables;
  if (typeof variables === 'string') {
    try {
      graphQLParams.variables = JSON.parse(variables);
    } catch {
      throw new Error('Variables are invalid JSON.');
    }
  }

  if (typeof variables === 'object') {
    graphQLParams.variables = { ...variables };
  }

  // Name of GraphQL operation to execute.
  const operationName = urlData.get('operationName') ?? body.operationName;
  if (typeof operationName === 'string') {
    graphQLParams.operationName = operationName;
  }

  return graphQLParams;
};

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

const readBody = async (
  request: http.IncomingMessage,
  opts: { charset: string },
): Promise<string> => {
  const { charset } = opts;
  if (!charset.startsWith('utf-')) {
    throw new Error(`Unsupported charset "${charset.toUpperCase()}".`);
  }
  const contentEncoding = request.headers['content-encoding'];
  const encoding = typeof contentEncoding === 'string' ? contentEncoding.toLowerCase() : 'identity';
  const length = encoding === 'identity' ? request.headers['content-length'] : null;
  const stream = decompressBody(request, encoding);

  try {
    const body = await getRawBody(stream, {
      encoding: charset,
      length,
    });

    return body;
  } catch (err) {
    throw new Error('Failed to parse body');
  }
};

export default bodyParser;
