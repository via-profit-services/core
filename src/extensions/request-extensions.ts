import crypto from 'node:crypto';
import type http from 'node:http';
import type { Context } from '../application/types';

/**
 * Fields of `extensions` set by the core. A project field with the same name
 * would be overwritten (or would overwrite a core field), so it is refused.
 */
export const RESERVED_EXTENSIONS: readonly string[] = Object.freeze([
  'requestId',
  'limits',
  'queryTime',
  'requestCounter',
  'startupTime',
  'diagnostics',
]);

type RequestRecord = {
  readonly requestId: string;
  /** Fields added by the project */
  readonly extensions: Record<string, unknown>;
};

/**
 * Request data by its context.
 *
 * Why a WeakMap and not a field in the context: the context belongs to the
 * project (it is typed and filled by the project), the core must not put its
 * own keys there. Every request gets its own context object, so the context
 * identifies the request. The WeakMap does not keep the context alive: the
 * record disappears together with the request.
 */
const records = new WeakMap<object, RequestRecord>();

export const registerRequest = (context: Context, record: RequestRecord) => {
  records.set(context, record);
};

/**
 * Proxies and load balancers (nginx `$request_id`, AWS ALB) pass their own
 * ID in X-Request-Id: reusing it connects the logs of the whole chain.
 * The header comes from outside and ends up in logs, so only a short string
 * of safe characters is accepted (no CR/LF: no fake log lines).
 */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

export const resolveRequestId = (request: http.IncomingMessage): string => {
  const header = request.headers['x-request-id'];

  return typeof header === 'string' && SAFE_REQUEST_ID.test(header) ? header : crypto.randomUUID();
};

/**
 * Adds a field to `extensions` of the response of the current request.
 * Works in resolvers and middlewares; the field is sent in every mode.
 *
 * @example
 * resolve: (_parent, args, context) => {
 *   setExtension(context, 'deprecation', 'Use «ordersV2»');
 * }
 *
 * Throws for a reserved name (see RESERVED_EXTENSIONS) and for a context
 * that does not belong to a request (`sharedContext: true` is not supported).
 */
export const setExtension = (context: Context, name: string, value: unknown) => {
  if (RESERVED_EXTENSIONS.includes(name)) {
    throw new Error(`The extensions field «${name}» is reserved by the core`);
  }

  const record = context && typeof context === 'object' ? records.get(context) : undefined;
  if (!record) {
    throw new Error(
      'setExtension: the context does not belong to a request (sharedContext: true is not supported)',
    );
  }

  record.extensions[name] = value;
};

/**
 * ID of the current request: the same value as `extensions.requestId`.
 * Use it in logs to connect a response with the server log records.
 */
export const getRequestId = (context: Context): string | undefined =>
  context && typeof context === 'object' ? records.get(context)?.requestId : undefined;
