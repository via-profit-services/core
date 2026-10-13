import { Kind, GraphQLError, GraphQLScalarType } from 'graphql';

/**
 * Schemes that execute code when such a URL is opened in a browser.
 * A value like `javascript:alert(document.cookie)` is a valid URL, but
 * rendering it as a link is an XSS.
 */
const FORBIDDEN_PROTOCOLS = new Set(['javascript:', 'vbscript:']);

const toURL = (value: unknown): URL => {
  if (!(value instanceof URL) && typeof value !== 'string') {
    throw new TypeError(`URL must be a string, got: ${typeof value}`);
  }

  let url: URL;
  try {
    url = new URL(value.toString());
  } catch {
    throw new TypeError(`Invalid URL: ${value}`);
  }

  if (FORBIDDEN_PROTOCOLS.has(url.protocol)) {
    throw new TypeError(`URL protocol «${url.protocol}» is not allowed`);
  }

  return url;
};

export default new GraphQLScalarType({
  name: 'URL',
  description:
    'A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt.',

  serialize(value) {
    return toURL(value).toString();
  },

  parseValue: toURL,

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as URLs but got a: ${ast.kind}`, {
        nodes: ast,
      });
    }

    return toURL(ast.value);
  },
});
