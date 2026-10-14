/**
 * Parsing of the headers of a multipart part: header block,
 * Content-Disposition (RFC 6266, RFC 5987) and the client filename.
 */

/**
 * Parses the headers block of a part. Header names are lower-cased.
 */
export const parseHeaders = (raw: string): Record<string, string> => {
  const headers: Record<string, string> = Object.create(null);

  for (const line of raw.split('\r\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const name = line.slice(0, colon).trim().toLowerCase();
      if (!(name in headers)) {
        headers[name] = line.slice(colon + 1).trim();
      }
    }
  }

  return headers;
};

/**
 * `form-data; name="file"; filename="photo.png"` →
 * `{ type: 'form-data', params: { name: 'file', filename: 'photo.png' } }`
 *
 * Supports quoted values with backslash escapes and the RFC 5987
 * `filename*=UTF-8''%D1%84.png` form.
 */
export const parseContentDisposition = (value: string) => {
  const semicolon = value.indexOf(';');
  const type = (semicolon === -1 ? value : value.slice(0, semicolon)).trim().toLowerCase();

  if (!type) {
    return null;
  }

  const params: Record<string, string> = Object.create(null);
  let i = semicolon === -1 ? value.length : semicolon + 1;

  while (i < value.length) {
    const eq = value.indexOf('=', i);
    if (eq === -1) {
      break;
    }

    const name = value.slice(i, eq).trim().toLowerCase();
    i = eq + 1;
    while (value[i] === ' ') {
      i += 1;
    }

    let paramValue = '';
    if (value[i] === '"') {
      i += 1;
      while (i < value.length && value[i] !== '"') {
        if (value[i] === '\\' && i + 1 < value.length) {
          i += 1;
        }
        paramValue += value[i];
        i += 1;
      }
      const next = value.indexOf(';', i);
      i = next === -1 ? value.length : next + 1;
    } else {
      const next = value.indexOf(';', i);
      paramValue = value.slice(i, next === -1 ? value.length : next).trim();
      i = next === -1 ? value.length : next + 1;
    }

    if (name === 'filename*') {
      const decoded = decodeExtendedValue(paramValue);
      if (decoded !== null) {
        params[name] = decoded;
      }
    } else if (name && !(name in params)) {
      params[name] = paramValue;
    }
  }

  return { type, params };
};

/**
 * RFC 5987: `UTF-8''%D1%84%D0%B0%D0%B9%D0%BB.png` → `файл.png`
 */
const decodeExtendedValue = (value: string): string | null => {
  const match = /^([\w!#$%&+^`{}~-]+)'[\w-]*'(.*)$/.exec(value);
  if (!match || match[1].toLowerCase() !== 'utf-8') {
    return null;
  }

  try {
    return decodeURIComponent(match[2]);
  } catch {
    return null;
  }
};

/**
 * The filename comes from the client and must never be trusted.
 * Some clients send a full path (`C:\Users\...\photo.png`): only the last
 * segment is kept. Control characters are removed.
 * The result is still NOT safe to be used as a path on the server.
 */
export const sanitizeFilename = (filename: string) =>
  // eslint-disable-next-line no-control-regex
  (filename.split(/[/\\]/).pop() || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
