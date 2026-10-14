import type http from 'node:http';
import { GraphQLError } from 'graphql';

import ServerError from '../errors/server-error';
import parseContentType from './content-type-parser';
import { CSRF_PREVENTION_HEADERS } from '../constants';

/**
 * HTTP-level checks: method, Content-Type, CSRF.
 * Throws a ServerError if the request must not be processed.
 */
const assertRequestAllowed = (request: http.IncomingMessage, csrfPrevention?: boolean) => {
  const method = request.method || '';
  const rawContentType = String(request.headers['content-type'] || 'application/json');
  const contentType = parseContentType(rawContentType);

  if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
    throw new ServerError(
      [new GraphQLError('GraphQL only supports GET, POST and OPTIONS requests')],
      'graphql-error-execute',
      405,
    );
  }

  if (contentType?.type !== 'application/json' && contentType?.type !== 'multipart/form-data') {
    throw new ServerError(
      [
        new GraphQLError(
          `Expected content-type: application/json or multipart/form-data. Got «${rawContentType}»`,
        ),
      ],
      'graphql-error-validate-request',
      415,
    );
  }

  // GET and multipart requests are sent by browsers without a CORS
  // preflight, so they must carry a header a foreign page cannot set
  if (
    csrfPrevention &&
    (method === 'GET' || contentType.type === 'multipart/form-data') &&
    !CSRF_PREVENTION_HEADERS.some(header => Boolean(request.headers[header]))
  ) {
    throw new ServerError(
      [
        new GraphQLError(
          `This request requires a non-empty «${CSRF_PREVENTION_HEADERS.join('» or «')}» header (CSRF prevention)`,
        ),
      ],
      'graphql-error-validate-request',
    );
  }
};

export default assertRequestAllowed;
