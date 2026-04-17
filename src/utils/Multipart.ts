import { Writable, PassThrough, Transform, TransformCallback } from 'node:stream';
import { TempFile } from './TempFile';
import { 
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FIELD_SIZE,
  DEFAULT_MAX_FILE_FIELDS,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_PARTS,
  DEFAULT_MAX_FILE_TOTAL_SIZE,
} from '../constants';

type Limits = {
  readonly maxFileSize: number;
  readonly maxFieldSize: number;
  readonly maxFilesTotalSize: number;
  readonly maxFiles: number;
  readonly maxFileFields: number;
  readonly maxFileParts: number;
};

type MultipartOptions = {
  headers: Record<string, any>;
  limits: Partial<Limits>;
};

export class Multipart extends Writable {
  private readonly boundary: Buffer;
  private readonly boundaryEnd: Buffer;

  private buffer = Buffer.alloc(0);
  private state: 'SEARCH' | 'HEADERS' | 'FIELD' | 'FILE' | 'DONE' = 'SEARCH';

  private headers: Record<string, string> = {};
  private fieldName = '';

  private fileTemp: TempFile | null = null;
  private fileStream: PassThrough | null = null;
  private fileSize = 0;
  private totalFiles = 0;
  private totalSize = 0;
  private partsCount = 0;
  private fieldsCount = 0;

  private readonly MAX_BUFFER_SIZE = 1024 * 1024 * 2;

  private finished = false;

  constructor(private opts: MultipartOptions) {
    super();
    this.boundary = Buffer.from('-');
    this.boundaryEnd = Buffer.from('-');
    const rawCT = opts.headers['content-type'] || opts.headers['Content-Type'] || '';
    const ct = rawCT.toLowerCase();

    if (!ct.includes('multipart/form-data')) {
      process.nextTick(() => this.destroy(new Error('Invalid multipart content-type')));
      return;
    }

    const match = rawCT.match(/boundary=([^;]+)/);
    if (!match) {
      process.nextTick(() => this.destroy(new Error('Missing multipart boundary')));
      return;
    }

    this.boundary = Buffer.from(`--${match[1]}`);
    this.boundaryEnd = Buffer.from(`--${match[1]}--`);
  }

  override _write(chunk: Buffer, _enc: any, cb: any) {
    if (this.state === 'DONE') return cb();

    try {
      this.processChunk(chunk);
      cb();
    } catch (err) {
      this.safeDestroy(err as Error);
      cb();
    }
  }

  private safeDestroy(err: Error) {
    if (this.finished) return;
    this.finished = true;

    if (this.fileStream) {
      this.fileStream.destroy();
      this.fileStream = null;
    }

    if (this.fileTemp) {
      try { this.fileTemp.end(); } catch {
        // do nothing
      }
      try { this.fileTemp.cleanup(); } catch {
        // do nothing
      }
      this.fileTemp = null;
    }

    super.destroy(err);
  }

  private processChunk(chunk: Buffer) {
    if (!this.boundary) {
      this.safeDestroy(new Error('Multipart parser used without boundary'));
      return;
    }

    if (this.state === 'DONE') return;

    if (this.buffer.length + chunk.length > this.MAX_BUFFER_SIZE) {
      this.safeDestroy(new Error('Multipart buffer overflow'));
      return;
    }

    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {

      //
      // SEARCH — ищем начало части
      //
      if (this.state === 'SEARCH') {
        const idx = this.findBoundary(this.buffer, this.boundary);
        if (idx === -1) return;

        const endIdx = this.findBoundary(this.buffer, this.boundaryEnd);
        if (endIdx === idx) {
          this.finishParsing();
          return;
        }

        this.partsCount++;
        if (this.partsCount > (this.opts.limits.maxFileParts || DEFAULT_MAX_FILE_PARTS)) {
          this.safeDestroy(
            new Error(`${this.opts.limits.maxFileParts} max multipart parts exceeded.`),
          );
          return;
        }

        this.buffer = this.buffer.slice(idx + this.boundary.length);

        if (this.buffer[0] === 13 && this.buffer[1] === 10) {
          this.buffer = this.buffer.slice(2);
        }

        this.state = 'HEADERS';
      }

      //
      // HEADERS
      //
      if (this.state === 'HEADERS') {
        const idx = this.buffer.indexOf('\r\n\r\n');
        if (idx === -1) return;

        const raw = this.buffer.slice(0, idx).toString();
        this.buffer = this.buffer.slice(idx + 4);

        this.headers = this.parseHeaders(raw);
        const cd = this.parseContentDisposition(this.headers['content-disposition']);

        if (!cd.name) {
          this.safeDestroy(new Error('Malformed Content-Disposition'));
          return;
        }

        this.fieldName = cd.name;

        if (cd.filename) {
          this.totalFiles++;
          if (this.totalFiles > (this.opts.limits.maxFiles || DEFAULT_MAX_FILES)) {
            this.safeDestroy(new Error(`${this.opts.limits.maxFiles} max file uploads exceeded.`));
            return;
          }

          this.state = 'FILE';
          this.fileTemp = new TempFile();
          this.fileStream = new PassThrough();
          this.fileSize = 0;

          this.emit('file', this.fieldName, this.fileStream, {
            filename: cd.filename,
            mimeType: this.headers['content-type'],
            encoding: '7bit',
          });
        } else {
          this.fieldsCount++;
          if (this.fieldsCount > (this.opts.limits.maxFileFields || DEFAULT_MAX_FILE_FIELDS)) {
            this.safeDestroy(
              new Error(`${this.opts.limits.maxFileFields} max field count exceeded.`),
            );
            return;
          }

          this.state = 'FIELD';
        }
      }

      //
      // FIELD
      //
      if (this.state === 'FIELD') {
        const idx = this.findBoundary(this.buffer, this.boundary);
        if (idx === -1) return;

        const value = this.buffer.slice(0, idx - 2).toString();

        if (value.length > (this.opts.limits.maxFieldSize || DEFAULT_MAX_FIELD_SIZE)) {
          this.safeDestroy(
            new Error(
              `Field «${this.fieldName}» exceeds the ${this.opts.limits.maxFieldSize} byte size limit.`,
            ),
          );
          return;
        }

        this.emit('field', this.fieldName, value, { valueTruncated: false });

        this.buffer = this.buffer.slice(idx);
        this.state = 'SEARCH';
      }

      //
      // FILE
      //
      if (this.state === 'FILE') {
        const idx = this.findBoundary(this.buffer, this.boundary);

        if (idx === -1) {
          this.writeFileChunk(this.buffer);
          this.buffer = Buffer.alloc(0);
          return;
        }

        const data = this.buffer.slice(0, idx - 2);
        this.writeFileChunk(data);

        this.fileStream?.end();
        this.fileTemp?.end();

        this.buffer = this.buffer.slice(idx);
        this.state = 'SEARCH';
      }
    }
  }

  private writeFileChunk(chunk: Buffer) {
    if (!this.fileStream || !this.fileTemp) return;

    this.fileStream.write(chunk);
    this.fileTemp.write(chunk);

    this.fileSize += chunk.length;
    this.totalSize += chunk.length;

    if (this.fileSize > (this.opts.limits.maxFileSize || DEFAULT_MAX_FILE_SIZE)) {
      this.fileStream.emit('limit');
      this.safeDestroy(
        new Error(`File exceeds the ${this.opts.limits.maxFileSize} byte size limit.`),
      );
    }

    if (this.totalSize > (this.opts.limits.maxFilesTotalSize || DEFAULT_MAX_FILE_TOTAL_SIZE)) {
      this.safeDestroy(
        new Error(
          `Total upload size exceeds the ${this.opts.limits.maxFilesTotalSize} byte limit.`,
        ),
      );
    }
  }

  private finishParsing() {
    if (this.finished) return;
    this.finished = true;

    if (this.fileStream) this.fileStream.end();
    if (this.fileTemp) this.fileTemp.end();

    this.emit('finish');
    this.state = 'DONE';
  }

  override _final(cb: any) {
    if (this.state !== 'DONE') {
      this.safeDestroy(new Error('Malformed multipart body'));
    }
    cb();
  }

  private parseHeaders(raw: string) {
    const out: Record<string, string> = {};
    raw.split('\r\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = line.slice(0, idx).trim().toLowerCase();
        const v = line.slice(idx + 1).trim();
        out[k] = v;
      }
    });
    return out;
  }

  private parseContentDisposition(value: string) {
    const out: Record<string, string> = {};
    if (!value) return out;

    value.split(';').forEach(part => {
      const [k, v] = part.trim().split('=');
      if (!v) return;
      out[k] = v.replace(/^"|"$/g, '');
    });

    return out;
  }

  private findBoundary(buffer: Buffer, boundary: Buffer): number {
    const seq = Buffer.concat([Buffer.from('\r\n'), boundary]);

    const idx = buffer.indexOf(seq);
    if (idx !== -1) {
      return idx + 2;
    }

    if (buffer.indexOf(boundary) === 0) {
      return 0;
    }

    return -1;
  }
}

export class NormalizeLineEndings extends Transform {
  private lastByte: number | null = null;

  _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback) {
    const out: number[] = [];

    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];

      if (byte === 0x0A && this.lastByte !== 0x0D) {
        out.push(0x0D, 0x0A);
      } else {
        out.push(byte);
      }

      this.lastByte = byte;
    }

    cb(null, Buffer.from(out));
  }
}
