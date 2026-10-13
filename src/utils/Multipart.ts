import { Readable, Writable } from 'node:stream';

import { HttpError } from './http-error';

/**
 * Streaming multipart/form-data parser (RFC 7578, RFC 2046).
 *
 * How a multipart body looks like (boundary is `XyZ`):
 *
 * ```
 * --XyZ\r\n                                          ← first delimiter
 * Content-Disposition: form-data; name="operations"\r\n
 * \r\n                                               ← end of part headers
 * {"query": "..."}                                   ← part body
 * \r\n--XyZ\r\n                                      ← delimiter
 * Content-Disposition: form-data; name="0"; filename="a.png"\r\n
 * Content-Type: image/png\r\n
 * \r\n
 * <binary data>
 * \r\n--XyZ--\r\n                                    ← closing delimiter
 * ```
 *
 * Key rules this parser relies on:
 *
 * 1. A delimiter is `CRLF + "--" + boundary`. The CRLF belongs to the
 *    delimiter, not to the part body. Bytes `--XyZ` inside a file are NOT a
 *    delimiter unless they are preceded by CRLF.
 * 2. The very first delimiter has no CRLF in front of it. To treat all
 *    delimiters the same way the parser starts with a virtual CRLF in its buffer.
 * 3. Data arrives in chunks of arbitrary size, so a delimiter may be split
 *    between two chunks. When a delimiter is not found, the parser keeps the
 *    last `delimiter.length - 1` bytes in the buffer (they may be the beginning
 *    of a delimiter) and releases only the bytes before them.
 *
 * The parser never holds a whole part in memory:
 * - file data is pushed into a Readable stream as soon as it is safe;
 *   if the consumer is slow, the parser stops accepting chunks (backpressure),
 *   so the request socket is paused instead of buffering in RAM;
 * - field values are collected up to `limits.fieldSize` bytes.
 *
 * All limits are checked while reading. On any violation the parser emits an
 * `error` and stops.
 *
 * Events:
 * - `field` (name: string, value: string)
 * - `file` (name: string, stream: Readable, info: MultipartFileInfo)
 * - `finish` - the closing delimiter was received and all parts were emitted
 * - `error` (err: MultipartError)
 */

export interface MultipartLimits {
  /** Max size of a non-file field value, bytes */
  readonly fieldSize: number;
  /** Max size of a single file, bytes */
  readonly fileSize: number;
  /** Max size of all files together, bytes */
  readonly filesTotalSize: number;
  /** Max number of file parts */
  readonly files: number;
  /** Max number of non-file parts */
  readonly fields: number;
  /** Max number of parts (fields + files) */
  readonly parts: number;
  /** Max size of the headers block of a single part, bytes */
  readonly headerSize: number;
}

export interface MultipartFileInfo {
  readonly filename: string;
  readonly mimeType: string;
  readonly encoding: string;
}

/**
 * A malformed multipart body is 400 (Bad Request),
 * an exceeded limit is 413 (Content Too Large).
 */
export class MultipartError extends HttpError {
  constructor(message: string, status = 400) {
    super(message, status);
    this.name = 'MultipartError';
  }
}

export const DEFAULT_MAX_PART_HEADER_SIZE = 16 * 1024;

/**
 * RFC 2046: 1–70 characters from a limited set, must not end with a space.
 */
const BOUNDARY_REGEX = /^[0-9a-zA-Z'()+_,\-./:=? ]{0,69}[0-9a-zA-Z'()+_,\-./:=?]$/;

export const isValidBoundary = (boundary: unknown): boundary is string =>
  typeof boundary === 'string' && BOUNDARY_REGEX.test(boundary);

const CR = 0x0d;
const LF = 0x0a;
const DASH = 0x2d;
const SPACE = 0x20;
const TAB = 0x09;
const EMPTY = Buffer.alloc(0);
const CRLF = Buffer.from('\r\n');
const HEADERS_END = Buffer.from('\r\n\r\n');
/** RFC 2046 allows whitespace between a delimiter and its CRLF */
const MAX_TRANSPORT_PADDING = 64;

type State = 'preamble' | 'after-delimiter' | 'headers' | 'body' | 'done';

type FieldPart = {
  readonly kind: 'field';
  readonly name: string;
  readonly chunks: Buffer[];
  size: number;
};

type FilePart = {
  readonly kind: 'file';
  readonly name: string;
  readonly filename: string;
  readonly stream: FileStream;
  size: number;
};

/**
 * Readable side of an uploaded file.
 * When the consumer asks for more data (`_read`), the parser is resumed.
 */
class FileStream extends Readable {
  constructor(private readonly onDemand: (stream: FileStream) => void) {
    super();
  }

  override _read() {
    this.onDemand(this);
  }
}

export class Multipart extends Writable {
  private readonly delimiter: Buffer;
  private buffer: Buffer = CRLF; // virtual CRLF before the first delimiter, see rule 2
  private state: State = 'preamble';
  private part: FieldPart | FilePart | null = null;

  private partsCount = 0;
  private fieldsCount = 0;
  private filesCount = 0;
  private filesTotalSize = 0;

  /** Stream whose internal buffer is full: wait until it is read */
  private pausedOn: FileStream | null = null;
  /** `_write` callback postponed because of backpressure */
  private pendingCallback: ((error?: Error | null) => void) | null = null;

  constructor(
    boundary: string,
    private readonly limits: MultipartLimits,
  ) {
    super();

    if (!isValidBoundary(boundary)) {
      throw new MultipartError('Invalid multipart boundary');
    }

    this.delimiter = Buffer.from(`\r\n--${boundary}`);
  }

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    // The buffer contains only a small unprocessed tail here, so concat is cheap
    this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;

    try {
      this.parse();
    } catch (err) {
      callback(err instanceof Error ? err : new MultipartError(String(err)));

      return;
    }

    // Backpressure: do not accept the next chunk until the file consumer
    // has read what was already pushed
    if (this.pausedOn) {
      this.pendingCallback = callback;

      return;
    }

    callback();
  }

  override _final(callback: (error?: Error | null) => void) {
    if (this.state !== 'done') {
      callback(
        new MultipartError('Unexpected end of multipart body: the closing boundary is missing'),
      );

      return;
    }

    callback();
  }

  override _destroy(error: Error | null, callback: (error?: Error | null) => void) {
    if (this.part?.kind === 'file') {
      const { stream } = this.part;
      // Emitting 'error' on a stream without 'error' listeners crashes the
      // process, so pass the error only if somebody is listening
      if (stream.listenerCount('error') > 0) {
        stream.destroy(error ?? new MultipartError('Multipart parsing was aborted'));
      } else {
        stream.destroy();
      }
    }

    this.part = null;
    this.buffer = EMPTY;
    this.pendingCallback = null;
    this.pausedOn = null;
    callback(error);
  }

  private resume(stream: FileStream) {
    if (this.pausedOn !== stream) {
      return;
    }

    this.pausedOn = null;
    const callback = this.pendingCallback;
    this.pendingCallback = null;
    callback?.();
  }

  private parse() {
    for (;;) {
      switch (this.state) {
        case 'preamble': {
          // Everything before the first delimiter is ignored (RFC 2046 preamble)
          const index = this.buffer.indexOf(this.delimiter);
          if (index === -1) {
            this.keepTail(this.delimiter.length - 1);

            return;
          }

          this.buffer = this.buffer.subarray(index + this.delimiter.length);
          this.state = 'after-delimiter';
          break;
        }

        case 'after-delimiter': {
          // `--` - closing delimiter, otherwise [whitespace] CRLF and a new part
          if (this.buffer.length < 2) {
            return;
          }

          if (this.buffer[0] === DASH && this.buffer[1] === DASH) {
            this.finishBody();

            return;
          }

          let i = 0;
          while (i < this.buffer.length && (this.buffer[i] === SPACE || this.buffer[i] === TAB)) {
            i += 1;
          }

          if (i > MAX_TRANSPORT_PADDING) {
            throw new MultipartError('Malformed multipart body: invalid boundary line');
          }

          if (this.buffer.length < i + 2) {
            return;
          }

          if (this.buffer[i] !== CR || this.buffer[i + 1] !== LF) {
            throw new MultipartError(
              'Malformed multipart body: a boundary must be followed by CRLF (bare LF line breaks are not allowed)',
            );
          }

          this.buffer = this.buffer.subarray(i + 2);
          this.partsCount += 1;
          if (this.partsCount > this.limits.parts) {
            throw new MultipartError(
              `Multipart request exceeds the limit of ${this.limits.parts} parts`,
              413,
            );
          }

          this.state = 'headers';
          break;
        }

        case 'headers': {
          // A part without headers starts with CRLF right away
          const index = this.buffer.subarray(0, 2).equals(CRLF)
            ? -2
            : this.buffer.indexOf(HEADERS_END);

          if (index === -1) {
            if (this.buffer.length > this.limits.headerSize) {
              throw new MultipartError(
                `Multipart part headers exceed the ${this.limits.headerSize} byte size limit`,
                413,
              );
            }

            return;
          }

          const headers = index === -2 ? '' : this.buffer.subarray(0, index).toString('utf8');
          this.buffer = this.buffer.subarray(index === -2 ? 2 : index + HEADERS_END.length);
          this.openPart(parseHeaders(headers));
          this.state = 'body';
          break;
        }

        case 'body': {
          const index = this.buffer.indexOf(this.delimiter);

          if (index === -1) {
            // Release everything except a tail that may be the start of a delimiter
            const safeLength = this.buffer.length - (this.delimiter.length - 1);
            if (safeLength > 0) {
              this.partData(this.buffer.subarray(0, safeLength));
              this.keepTail(this.delimiter.length - 1);
            }

            return;
          }

          if (index > 0) {
            this.partData(this.buffer.subarray(0, index));
          }

          this.buffer = this.buffer.subarray(index + this.delimiter.length);
          this.closePart();
          this.state = 'after-delimiter';
          break;
        }

        case 'done':
        default:
          // RFC 2046 epilogue: ignored
          this.buffer = EMPTY;

          return;
      }
    }
  }

  /**
   * Keeps only the last `length` bytes. They are copied, so the large
   * incoming chunk can be garbage-collected.
   */
  private keepTail(length: number) {
    if (this.buffer.length > length) {
      this.buffer = Buffer.from(this.buffer.subarray(this.buffer.length - length));
    }
  }

  private openPart(headers: Record<string, string>) {
    const disposition = parseContentDisposition(headers['content-disposition'] || '');

    if (!disposition || disposition.type !== 'form-data' || !disposition.params.name) {
      throw new MultipartError(
        'Malformed multipart part: Content-Disposition "form-data" with a "name" is required',
      );
    }

    const { name } = disposition.params;
    const filename = disposition.params['filename*'] ?? disposition.params.filename;

    // A part is a file when it has the filename parameter, even an empty one
    if (typeof filename === 'undefined') {
      this.fieldsCount += 1;
      if (this.fieldsCount > this.limits.fields) {
        throw new MultipartError(
          `Multipart request exceeds the limit of ${this.limits.fields} non-file field parts`,
          413,
        );
      }

      this.part = { kind: 'field', name, chunks: [], size: 0 };

      return;
    }

    this.filesCount += 1;
    if (this.filesCount > this.limits.files) {
      throw new MultipartError(
        `Multipart request exceeds the limit of ${this.limits.files} files`,
        413,
      );
    }

    const stream = new FileStream(s => this.resume(s));
    // If the consumer destroyed the stream, it will never ask for data again
    stream.once('close', () => this.resume(stream));
    const info: MultipartFileInfo = {
      filename: sanitizeFilename(filename),
      mimeType: (headers['content-type'] || 'application/octet-stream')
        .split(';')[0]
        .trim()
        .toLowerCase(),
      encoding: (headers['content-transfer-encoding'] || '7bit').toLowerCase(),
    };

    this.part = { kind: 'file', name, filename: info.filename, stream, size: 0 };
    this.emit('file', name, stream, info);
  }

  private partData(data: Buffer) {
    const { part } = this;
    if (!part) {
      return;
    }

    part.size += data.length;

    if (part.kind === 'field') {
      if (part.size > this.limits.fieldSize) {
        throw new MultipartError(
          `The «${part.name}» multipart field value exceeds the ${this.limits.fieldSize} byte size limit`,
          413,
        );
      }

      part.chunks.push(Buffer.from(data));

      return;
    }

    this.filesTotalSize += data.length;

    if (part.size > this.limits.fileSize) {
      throw new MultipartError(
        `File «${part.filename}» exceeds the ${this.limits.fileSize} byte size limit`,
        413,
      );
    }

    if (this.filesTotalSize > this.limits.filesTotalSize) {
      throw new MultipartError(
        `Total upload size exceeds the ${this.limits.filesTotalSize} byte size limit`,
        413,
      );
    }

    // push() returns false when the stream's internal buffer is full
    if (!part.stream.push(data)) {
      this.pausedOn = part.stream;
    }
  }

  private closePart() {
    const { part } = this;
    this.part = null;

    if (part?.kind === 'field') {
      this.emit('field', part.name, Buffer.concat(part.chunks).toString('utf8'));
    }

    if (part?.kind === 'file') {
      part.stream.push(null);
    }
  }

  private finishBody() {
    this.state = 'done';
    this.buffer = EMPTY;
  }
}

/**
 * Parses the headers block of a part. Header names are lower-cased.
 */
const parseHeaders = (raw: string): Record<string, string> => {
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
const parseContentDisposition = (value: string) => {
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
const sanitizeFilename = (filename: string) =>
  // eslint-disable-next-line no-control-regex
  (filename.split(/[/\\]/).pop() || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
