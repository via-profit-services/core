import type { RequestBody } from '@via-profit-services/core';
import contentType from 'content-type';
import { Request } from 'express';
import getRawBody from 'raw-body';
import zlib from 'zlib';

import BadRequestError from '../errorHandlers/BadRequestError';
import ServerError from '../errorHandlers/ServerError';

type BodyParser = (reqest: Request) => Promise<RequestBody>;

const JSONOBJREGEX = /^[ \t\n\r]*\{/;

const parseBody: BodyParser = async (req) => {
  const { body, headers } = req;
  // If express has already parsed a body as a keyed object, use it.
  if (typeof body === 'object' && !(body instanceof Buffer)) {
    return body as RequestBody;
  }

  // Skip requests without content types.
  if (headers['content-type'] === undefined) {
    throw new BadRequestError('Missing content-type header');
  }

  const { type, parameters } = contentType.parse(req);

  // If express has already parsed a body as a string, and the content-type
  // was application/graphql, parse the string body.
  if (typeof body === 'string' && type === 'application/graphql') {
    return { query: body };
  }

  const charset = parameters.charset?.toLowerCase() ?? 'utf-8';
  if (!charset.startsWith('utf-')) {
    throw new BadRequestError(`Unsupported charset "${charset.toUpperCase()}".`);
  }


  const rawBody = await readBody(req, { charset });

  switch (type) {
    case 'application/graphql':
      return {
        query: rawBody,
      };

      case 'application/json':
      if (JSONOBJREGEX.test(rawBody)) {
        try {
          return JSON.parse(rawBody);
        } catch {
          // Do nothing
        }
      }
      throw new BadRequestError(`POST body sent invalid JSON with content-type: «${type}»`);

    // case 'application/x-www-form-urlencoded':
    //   return querystring.parse(rawBody);

    default:
      return rawBody;
      // throw new BadRequestError(`POST body sent empty data with content-type: «${type}»`);
  }

}

interface GraphQLParams {
  query: string;
  variables: {readonly [key: string]: unknown} | null;
  operationName: string | null;
}

interface GraphQLParamsProps {
  body: RequestBody;
  request: Request;
}

export const parseGraphQLParams = (props: GraphQLParamsProps): GraphQLParams => {
  const { body, request } = props;
  const urlData = new URLSearchParams(request.url.split('?')[1]);

  const graphQLParams: GraphQLParams = {
    query: '',
    variables: null,
    operationName: null,
  }

  if (typeof body.query === 'string') {
    graphQLParams.query = body.query;
  }

  const variables = urlData.get('variables') ?? body.variables;
  if (typeof variables === 'string') {
    try {
      graphQLParams.variables = JSON.parse(variables);
    } catch {
      throw new ServerError('Variables are invalid JSON.');
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
}

const decompressBody = (request: Request, encoding: string) => {
  switch (encoding) {
    case 'identity':
      return request;

    case 'deflate':
      return request.pipe(zlib.createInflate());

    case 'gzip':
      return request.pipe(zlib.createGunzip());

    default:
      throw new ServerError(`Unsupported content-encoding "${encoding}".`);
  }
}


const readBody = async (request: Request, opts: { charset: string }): Promise<string> => {
  const { charset } = opts;
  if (!charset.startsWith('utf-')) {
    throw new ServerError(`Unsupported charset "${charset.toUpperCase()}".`);
  }
  const contentEncoding = request.headers['content-encoding'];
  const encoding =
    typeof contentEncoding === 'string'
      ? contentEncoding.toLowerCase()
      : 'identity';
  const length = encoding === 'identity' ? request.headers['content-length'] : null;
  const stream = decompressBody(request, encoding);

  try {

    const body = await getRawBody(stream, {
      encoding: charset,
      length,
    });

    return body;
  } catch (err) {

    throw new ServerError('Failed to parse body', { err })
  }

}


export default parseBody;
