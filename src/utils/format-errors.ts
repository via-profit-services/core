import type { Context, ServerErrorType } from '@via-profit-services/core';
import { GraphQLFormattedError, GraphQLError } from 'graphql';
import ServerError from '../server-error';

export const MASKED_ERROR_MESSAGE = 'Internal server error';

type FormatOptions = {
  readonly debug?: boolean;
  readonly maskErrors?: boolean;
  readonly onError?: (error: Error) => void;
};

type FormatErrors = (
  props: FormatOptions & {
    error: unknown;
    context: Context;
  },
) => readonly GraphQLFormattedError[];

const stacktrace = (error: Error) =>
  typeof error.stack === 'string' ? error.stack.split('\n') : undefined;

/**
 * `extensions.http` only carries the HTTP status for the server
 * (`throw new GraphQLError('...', { extensions: { http: { status: 401 } } })`)
 * and is not sent to the client.
 */
const publicExtensions = (extensions: GraphQLFormattedError['extensions']) => {
  if (!extensions || !('http' in extensions)) {
    return extensions;
  }

  const { http: _http, ...rest } = extensions;

  return Object.keys(rest).length ? rest : undefined;
};

const report = (error: Error, onError: FormatOptions['onError']) => {
  try {
    onError?.(error);
  } catch {
    // a broken logger must not break the response
  }
};

/**
 * Formats an error of execution (thrown by a resolver or by graphql-js).
 *
 * Which errors are public:
 *   - errors created by graphql-js itself (no originalError), e.g.
 *     "Cannot return null for non-nullable field";
 *   - GraphQLError thrown by a resolver on purpose:
 *     `throw new GraphQLError('Access denied', { extensions: { code: 'FORBIDDEN' } })`.
 *
 * Anything else (a plain Error, a database driver error...) may contain
 * internal details: SQL, hosts, credentials. With `maskErrors` such errors
 * are replaced by "Internal server error"; `onError` still receives the
 * original error for logging.
 */
export const formatExecutionErrors = (
  errors: readonly GraphQLError[] | undefined,
  options: FormatOptions,
): GraphQLFormattedError[] | undefined => {
  if (!errors || errors.length === 0) {
    return undefined;
  }

  const { debug, maskErrors, onError } = options;

  return errors.map(error => {
    const original = error.originalError;
    report(original ?? error, onError);

    const isPublic = !original || original instanceof GraphQLError;
    const json = error.toJSON();
    const formatted = { ...json, extensions: publicExtensions(json.extensions) };

    if (maskErrors && !isPublic) {
      return {
        message: MASKED_ERROR_MESSAGE,
        locations: formatted.locations,
        path: formatted.path,
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          ...(debug ? { stacktrace: stacktrace(original) } : {}),
        },
      };
    }

    if (debug) {
      return {
        ...formatted,
        extensions: { ...formatted.extensions, stacktrace: stacktrace(original ?? error) },
      };
    }

    if (!formatted.extensions) {
      delete formatted.extensions;
    }

    return formatted;
  });
};

/**
 * Formats an error thrown before execution (request parsing, validation,
 * middleware...).
 *
 * ServerError and GraphQLError are created by the core or on purpose and
 * are always public. Other errors (e.g. thrown by a middleware) are masked
 * when `maskErrors` is enabled.
 */
const formatErrors: FormatErrors = ({ error, debug, maskErrors, onError }) => {
  if (error instanceof ServerError && Array.isArray(error.graphqlErrors)) {
    const { graphqlErrors, errorType } = error as {
      graphqlErrors: readonly GraphQLError[];
      errorType: ServerErrorType;
    };

    return graphqlErrors.map(graphqlError => {
      report(graphqlError, onError);
      const formatted = graphqlError.toJSON();

      return {
        ...formatted,
        extensions: {
          ...publicExtensions(formatted.extensions),
          errorType,
          ...(debug ? { stacktrace: stacktrace(graphqlError) } : {}),
        },
      };
    });
  }

  if (error instanceof GraphQLError) {
    return formatExecutionErrors([error], { debug, maskErrors, onError }) ?? [];
  }

  if (error instanceof Error) {
    report(error, onError);

    if (maskErrors) {
      return [
        {
          message: MASKED_ERROR_MESSAGE,
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            ...(debug ? { stacktrace: stacktrace(error) } : {}),
          },
        },
      ];
    }

    return [
      {
        message: error.message,
        extensions: debug ? { stacktrace: stacktrace(error) } : undefined,
      },
    ];
  }

  return [{ message: maskErrors ? MASKED_ERROR_MESSAGE : String(error) }];
};

export default formatErrors;
