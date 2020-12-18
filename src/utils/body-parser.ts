import contentType from 'content-type';
import { Request } from 'express';
import rawBody from 'raw-body';
import type { Inflate, Gunzip } from 'zlib';
import zlib from 'zlib';

type BodyAsObject = {
  operationName?: unknown;
  query?: unknown;
  variables?: unknown;
  [key: string]: unknown;
};

type BodyParser = (reqest: Request) => Promise<BodyAsObject>;

const JSONOBJREGEX = /^[ \t\n\r]*\{/;

const parseBody: BodyParser = async (req) => {
  const { body, headers } = req;

  // If express has already parsed a body as a keyed object, use it.
  if (typeof body === 'object' && !(body instanceof Buffer)) {
    return body as BodyAsObject;
  }

  // Skip requests without content types.
  if (headers['content-type'] === undefined) {
    return {};
  }

  const { type, parameters } = contentType.parse(req);

  // If express has already parsed a body as a string, and the content-type
  // was application/graphql, parse the string body.
  if (typeof body === 'string' && type === 'application/graphql') {
    return { query: body };
  }

  // Already parsed body we didn't recognise? Parse nothing.
  if (body != null) {
    return {};
  }

  const charset = parameters.charset?.toLowerCase() ?? 'utf-8';
  if (!charset.startsWith('utf-')) {
    throw Error(`Unsupported charset "${charset.toUpperCase()}".`);
  }

  const rawBody = await readBody(req, { charset });
  // Use the correct body parser based on Content-Type header.


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
      throw Error('POST body sent invalid JSON.');

    // case 'application/x-www-form-urlencoded':
    //   return querystring.parse(rawBody);

    default:
      throw Error('Invalid body. Check content-type header')
  }


  // parseGraphQLParams
  // If no Content-Type header matches, parse nothing.
  // return {};
}

interface GraphQLParams {
  query: string | null;
  variables: {readonly [key: string]: unknown} | null;
  operationName: string | null;
}

interface GraphQLParamsProps {
  body: BodyAsObject;
  request: Request;
}

export const parseGraphQLParams = (props: GraphQLParamsProps): GraphQLParams => {
  const { body, request } = props;
  const urlData = new URLSearchParams(request.url.split('?')[1]);

  const graphQLParams: GraphQLParams = {
    query: null,
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
      throw Error('Variables are invalid JSON.');
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
const readBody = async (req: Request, opts: { charset: string }): Promise<string> => {
  const { charset } = opts;
  if (!charset.startsWith('utf-')) {
    throw Error(`Unsupported charset "${charset.toUpperCase()}".`);
  }
  const contentEncoding = req.headers['content-encoding'];
  const encoding =
    typeof contentEncoding === 'string'
      ? contentEncoding.toLowerCase()
      : 'identity';
  const length = encoding === 'identity' ? req.headers['content-length'] : null;
  const limit = 100 * 1024; // 100kb
  let stream: Request | Inflate | Gunzip;

  // decompress stream
  switch (encoding) {
    case 'identity':
        stream = req;
      break;
    case 'deflate':
      stream = req.pipe(zlib.createInflate());
      break;
    case 'gzip':
      stream = req.pipe(zlib.createGunzip());
    break;
    default:
      throw new Error(`Unsupported content-encoding "${encoding}".`);
  }

  try {

    const body = await rawBody(stream, { encoding: charset, length, limit });

    return body;
  } catch (err) {
    console.error(err)
    throw new Error('Failed to parse body')
  }

}


export default parseBody;
