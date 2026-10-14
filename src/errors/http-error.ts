/**
 * An error that knows which HTTP status code it corresponds to.
 *
 * The core reports errors in the response body, but the HTTP status code is
 * chosen from the error that stopped the request (see `response.status`).
 * Errors of request parsing are created as HttpError so that the exact
 * reason is not lost: 413 for a too large body, 415 for an unsupported
 * content type, 400 for a malformed request.
 */
export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const isValidHttpStatus = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 100 && value <= 599;
