export type ParsedContentType = {
  /**
   * Media type in lower case, e.g. `multipart/form-data`
   */
  readonly type: string;

  /**
   * Parameters. Names are in lower case, values keep their case
   * (a multipart boundary is case-sensitive).
   */
  readonly params: Record<string, string>;

  /**
   * Original header value
   */
  toString(): string;
};

const TOKEN_REGEX = /^[!#$%&'*+.^_`|~0-9a-z-]+$/i;
const MEDIA_TYPE_REGEX = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/;

/**
 * Parses a Content-Type header value (RFC 9110, section 8.3).
 *
 * `multipart/form-data; boundary="----abc=="` →
 * `{ type: 'multipart/form-data', params: { boundary: '----abc==' } }`
 *
 * Supports quoted parameter values with backslash escapes.
 * Returns null if the media type is malformed.
 */
const parseContentType = (contentType: string): ParsedContentType | null => {
  const source = String(contentType);
  const semicolonIndex = source.indexOf(';');
  const type = (semicolonIndex === -1 ? source : source.slice(0, semicolonIndex))
    .trim()
    .toLowerCase();

  if (!MEDIA_TYPE_REGEX.test(type)) {
    return null;
  }

  const params: Record<string, string> = Object.create(null);
  let i = semicolonIndex === -1 ? source.length : semicolonIndex + 1;

  while (i < source.length) {
    // parameter name
    const eqIndex = source.indexOf('=', i);
    if (eqIndex === -1) {
      break;
    }

    const name = source.slice(i, eqIndex).trim().toLowerCase();
    i = eqIndex + 1;

    // parameter value: quoted-string or token
    let value = '';
    if (source[i] === '"') {
      i += 1;
      while (i < source.length && source[i] !== '"') {
        if (source[i] === '\\' && i + 1 < source.length) {
          i += 1;
        }
        value += source[i];
        i += 1;
      }
      i += 1; // closing quote
      const next = source.indexOf(';', i);
      i = next === -1 ? source.length : next + 1;
    } else {
      const next = source.indexOf(';', i);
      value = source.slice(i, next === -1 ? source.length : next).trim();
      i = next === -1 ? source.length : next + 1;
    }

    // the first occurrence wins, invalid names are skipped
    if (TOKEN_REGEX.test(name) && !(name in params)) {
      params[name] = value;
    }
  }

  return {
    type,
    params,
    toString: () => source,
  };
};

export default parseContentType;
