import contentType from 'content-type';
import type { ParsedMediaType } from 'content-type';
import type { IncomingMessage } from 'http';
import querystring from 'querystring';
import getBody from 'raw-body';
import type { Inflate, Gunzip } from 'zlib';
import zlib from 'zlib';

import BadRequestError from '../errorHandlers/BadRequestError';

type Request = IncomingMessage & {
  body?: unknown;
};


/**
 * RegExp to match an Object-opening brace "{" as the first non-space
 * in a string. Allowed whitespace is defined in RFC 7159:
 *
 *     ' '   Space
 *     '\t'  Horizontal tab
 *     '\n'  Line feed or New line
 *     '\r'  Carriage return
 */
const JSON_OBJ_REGEX = /^[ \t\n\r]*\{/;

// Return a decompressed stream, given an encoding.
const decompressed = (req: Request, encoding: string): Request | Inflate | Gunzip => {
  switch (encoding) {
    case 'identity':
      return req;
    case 'deflate':
      return req.pipe(zlib.createInflate());
    case 'gzip':
      return req.pipe(zlib.createGunzip());
    default:
      throw new BadRequestError(`Unsupported content-encoding "${encoding}".`);
  }
}


// Read and parse a request body.
const readBody = async (req: Request, typeInfo: ParsedMediaType): Promise<string> => {
  const charset = typeInfo.parameters.charset?.toLowerCase() ?? 'utf-8';

  // Assert charset encoding per JSON RFC 7159 sec 8.1
  if (!charset.startsWith('utf-')) {
    throw new BadRequestError(`Unsupported charset "${charset.toUpperCase()}"`);
  }

  // Get content-encoding (e.g. gzip)
  const contentEncoding = req.headers['content-encoding'];
  const encoding = typeof contentEncoding === 'string'
      ? contentEncoding.toLowerCase()
      : 'identity';
  const length = encoding === 'identity' ? req.headers['content-length'] : null;
  const limit = 100 * 1024; // 100kb
  const stream = decompressed(req, encoding);

  // Read body from stream.
  try {
    return await getBody(stream, { encoding: charset, length, limit });
  } catch (err) {

    throw new BadRequestError('Invalid body', { err });
  }
}


/**
 * Provided a "Request" provided by express or connect (typically a node style
 * HTTPClientRequest), Promise the body data contained.
 */
const parseBody = async (req: Request): Promise<{ [param: string]: unknown }> => {
  const { body } = req;

  // If express has already parsed a body as a keyed object, use it.
  if (typeof body === 'object' && !(body instanceof Buffer)) {
    return body as { [param: string]: unknown };
  }

  // Skip requests without content types.
  if (req.headers['content-type'] === undefined) {
    return {};
  }

  const typeInfo = contentType.parse(req);

  // If express has already parsed a body as a string, and the content-type
  // was application/graphql, parse the string body.
  if (typeof body === 'string' && typeInfo.type === 'application/graphql') {
    return { query: body };
  }

  // Already parsed body we didn't recognise? Parse nothing.
  if (body != null) {
    return {};
  }

  const rawBody = await readBody(req, typeInfo);
  // Use the correct body parser based on Content-Type header.
  switch (typeInfo.type) {
    case 'application/graphql':
      return { query: rawBody };

    case 'application/json':
      if (JSON_OBJ_REGEX.test(rawBody)) {
        try {
          return JSON.parse(rawBody);
        } catch {
          // Do nothing
        }
      }
      throw new BadRequestError('POST body sent invalid JSON');
    case 'application/x-www-form-urlencoded':

      return querystring.parse(rawBody);

    default:
      return {}; // If no Content-Type header matches, parse nothing.
  }
}

export default parseBody;
