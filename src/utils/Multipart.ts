import { Writable, PassThrough } from 'node:stream';
import { TempFile } from './TempFile';

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
  private readonly boundary: Buffer | null = null;
  private readonly boundaryEnd: Buffer | null = null;

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

  constructor(private opts: MultipartOptions) {
    super();

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
    if (this.state === 'DONE') {
      return cb();
    }

    try {
      this.processChunk(chunk);
      cb();
    } catch (err) {
      this.destroy(err as Error);
      cb();
    }
  }

  private processChunk(chunk: Buffer) {
    if (!this.boundary) {
      this.destroy(new Error('Multipart parser used without boundary'));
      return;
    }

    if (this.state === 'DONE') {
      return;
    }

    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      if (this.state === 'SEARCH') {
        const idx = this.buffer.indexOf(this.boundary);
        if (idx === -1) {
          return;
        }

        if (this.buffer.indexOf(this.boundaryEnd) === idx) {
          this.finishParsing();
          return;
        }

        this.partsCount++;
        if (this.partsCount > this.opts.limits.maxFileParts) {
          this.destroy(new Error(`${this.opts.limits.maxFileParts} max multipart parts exceeded.`));
          return;
        }

        this.buffer = this.buffer.slice(idx + this.boundary.length + 2);
        this.state = 'HEADERS';
      }

      if (this.state === 'HEADERS') {
        const idx = this.buffer.indexOf('\r\n\r\n');
        if (idx === -1) {
          return;
        }

        const raw = this.buffer.slice(0, idx).toString();
        this.buffer = this.buffer.slice(idx + 4);

        this.headers = this.parseHeaders(raw);
        const cd = this.parseContentDisposition(this.headers['content-disposition']);

        if (!cd.name) {
          this.destroy(new Error('Malformed Content-Disposition'));
          return;
        }

        this.fieldName = cd.name;

        if (cd.filename) {
          this.totalFiles++;
          if (this.totalFiles > this.opts.limits.maxFiles) {
            this.destroy(new Error(`${this.opts.limits.maxFiles} max file uploads exceeded.`));
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
          if (this.fieldsCount > this.opts.limits.maxFileFields) {
            this.destroy(new Error(`${this.opts.limits.maxFileFields} max field count exceeded.`));
            return;
          }

          this.state = 'FIELD';
        }
      }

      if (this.state === 'FIELD') {
        const idx = this.buffer.indexOf(this.boundary);
        if (idx === -1) return;

        const value = this.buffer.slice(0, idx - 2).toString();

        if (value.length > this.opts.limits.maxFieldSize) {
          this.destroy(
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

      if (this.state === 'FILE') {
        const idx = this.buffer.indexOf(this.boundary);
        if (idx === -1) {
          this.fileStream?.write(this.buffer);
          this.fileTemp?.write(this.buffer);
          this.fileSize += this.buffer.length;
          this.totalSize += this.buffer.length;

          if (this.fileSize > this.opts.limits.maxFileSize) {
            this.fileStream?.emit('limit');
            this.destroy(
              new Error(`File exceeds the ${this.opts.limits.maxFileSize} byte size limit.`),
            );
            return;
          }

          if (this.totalSize > this.opts.limits.maxFilesTotalSize) {
            this.destroy(
              new Error(
                `Total upload size exceeds the ${this.opts.limits.maxFilesTotalSize} byte limit.`,
              ),
            );
            return;
          }

          this.buffer = Buffer.alloc(0);
          return;
        }

        const data = this.buffer.slice(0, idx - 2);

        this.fileStream?.write(data);
        this.fileTemp?.write(data);

        this.fileSize += data.length;
        this.totalSize += data.length;

        if (this.fileSize > this.opts.limits.maxFileSize) {
          this.fileStream?.emit('limit');
          this.destroy(
            new Error(`File exceeds the ${this.opts.limits.maxFileSize} byte size limit.`),
          );
          return;
        }

        if (this.totalSize > this.opts.limits.maxFilesTotalSize) {
          this.destroy(
            new Error(
              `Total upload size exceeds the ${this.opts.limits.maxFilesTotalSize} byte limit.`,
            ),
          );
          return;
        }

        this.fileStream?.end();
        this.fileTemp?.end();

        this.buffer = this.buffer.slice(idx);
        this.state = 'SEARCH';
      }
    }
  }

  private finishParsing() {
    if (this.fileStream) this.fileStream.end();
    if (this.fileTemp) this.fileTemp.end();

    this.emit('finish');
    this.state = 'DONE';
  }

  override _final(cb: any) {
    if (this.state !== 'DONE') {
      this.destroy(new Error('Malformed multipart body'));
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
    value.split(';').forEach(part => {
      const [k, v] = part.trim().split('=');
      if (!v) return;
      out[k] = v.replace(/^"|"$/g, '');
    });
    return out;
  }
}
