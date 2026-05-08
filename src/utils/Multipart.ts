import { PassThrough, Transform, TransformCallback, Writable } from 'node:stream';

type MultipartOptions = {
  headers: Record<string, any>;
};

export class Multipart extends Writable {
  private readonly boundary: Buffer;

  private buffer = Buffer.alloc(0);
  private state: 'SEARCH' | 'HEADERS' | 'FIELD' | 'FILE' | 'DONE' = 'SEARCH';

  private headers: Record<string, string> = {};
  private fieldName = '';

  // private fileTemp: TempFile | null = null;
  private fileStream: PassThrough | null = null;
  private fileSize = 0;
  private totalFiles = 0;
  private totalSize = 0;
  private partsCount = 0;
  private fieldsCount = 0;

  private readonly MAX_BUFFER_SIZE = 1024 * 1024 * 2;

  private finished = false;

  // Буферы для отсроченного эмита событий
  private pendingFields: Array<{ name: string; value: string; truncated: boolean }> = [];
  private pendingFiles: Array<{
    name: string;
    stream: PassThrough;
    info: { filename: string; mimeType: string; encoding: string; fileSize: number };
  }> = [];

  private eventsFlushed = false;

  constructor(private opts: MultipartOptions) {
    super();

    this.boundary = Buffer.from('');

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
  }

  override _write(chunk: Buffer, _enc: any, cb: any) {
    if (this.state === 'DONE') {
      return cb();
    }

    try {
      this.processChunk(chunk);
      cb();
    } catch (err) {
      this.safeDestroy(err as Error);
      cb();
    }
  }

  override _final(cb: any) {
    if (this.state !== 'DONE') {
      // Проверяем, что все boundaries закрыты
      if (this.buffer.length > 0) {
        this.safeDestroy(new Error('Malformed multipart body'));
      } else {
        this.finishParsing();
      }
    }
    cb();
  }

  private safeDestroy(err: Error) {
    if (this.finished) {
      return;
    }
    this.finished = true;

    if (this.fileStream) {
      this.fileStream.destroy();
      this.fileStream = null;
    }

    super.destroy(err);
  }

  private writeFileChunk(chunk: Buffer) {
    if (!this.fileStream) {
      return;
    }

    this.fileStream.write(chunk);
    this.fileSize += chunk.length;
    this.totalSize += chunk.length;
  }

  private flushEvents() {
    if (this.eventsFlushed) return;
    this.eventsFlushed = true;

    // Сначала все поля
    for (const field of this.pendingFields) {
      this.emit('field', field.name, field.value, { valueTruncated: field.truncated });
    }

    // Затем все файлы
    for (const file of this.pendingFiles) {
      this.emit('file', file.name, file.stream, file.info);
    }

    // Очищаем буферы
    this.pendingFields = [];
    this.pendingFiles = [];
  }

  private finishParsing() {
    if (this.finished) return;
    this.finished = true;

    // Сбрасываем все накопленные события
    this.flushEvents();

    if (this.fileStream) {
      this.fileStream.end();
      this.fileStream = null;
    }

    this.emit('finish');
    this.state = 'DONE';
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
      const trimmed = part.trim();
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;

      const k = trimmed.slice(0, eqIndex).trim();
      let v = trimmed.slice(eqIndex + 1).trim();
      // Убираем кавычки
      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    });

    return out;
  }

  private processChunk(chunk: Buffer) {
    if (!this.boundary) {
      this.safeDestroy(new Error('Multipart parser used without boundary'));
      return;
    }

    if (this.state === 'DONE') {
      return;
    }

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
        const boundaryInfo = this.findNextBoundary(this.buffer, this.boundary);

        if (!boundaryInfo) {
          // Не нашли boundary, ждем следующий chunk
          return;
        }

        const { endPos, isClosing } = boundaryInfo;

        if (isClosing) {
          // Это closing boundary, заканчиваем парсинг
          this.buffer = this.buffer.slice(endPos);
          this.finishParsing();
          return;
        }

        // Удаляем все до конца boundary
        this.buffer = this.buffer.slice(endPos);

        // Удаляем следующий \r\n если есть
        if (this.buffer[0] === 13 && this.buffer[1] === 10) {
          this.buffer = this.buffer.slice(2);
        }

        this.partsCount++;
        this.state = 'HEADERS';
        continue;
      }

      //
      // HEADERS
      //
      if (this.state === 'HEADERS') {
        console.log('HEADERS: looking for end of headers');
        console.log('Buffer for headers:', this.buffer.slice(0, 200).toString());

        const idx = this.buffer.indexOf('\r\n\r\n');
        if (idx === -1) {
          console.log('HEADERS: waiting for end of headers, buffer length:', this.buffer.length);
          return;
        }

        console.log('HEADERS: found headers end at idx:', idx);

        const raw = this.buffer.slice(0, idx).toString();
        console.log('HEADERS raw content:', raw);

        this.buffer = this.buffer.slice(idx + 4);

        this.headers = this.parseHeaders(raw);
        const cd = this.parseContentDisposition(this.headers['content-disposition']);

        console.log('HEADERS: parsed field:', cd.name, 'has filename:', !!cd.filename);

        if (!cd.name) {
          this.safeDestroy(new Error('Malformed Content-Disposition'));
          return;
        }

        this.fieldName = cd.name;

        if (cd.filename) {
          this.totalFiles++;
          this.state = 'FILE';
          this.fileStream = new PassThrough();
          this.fileSize = 0;
        } else {
          this.fieldsCount++;

          console.log('Starting FIELD for field:', this.fieldName);
          this.state = 'FIELD';
        }
        continue; // Продолжаем цикл, чтобы сразу обработать FIELD или FILE
      }

      //
      // FIELD
      //
      if (this.state === 'FIELD') {
        console.log(
          `FIELD: processing field "${this.fieldName}", buffer length: ${this.buffer.length}`,
        );

        const boundaryInfo = this.findNextBoundary(this.buffer, this.boundary);
        if (!boundaryInfo) {
          console.log(`FIELD: boundary not found for field "${this.fieldName}"`);
          return;
        }

        const { position, hasCRLF } = boundaryInfo;
        console.log(`FIELD: found boundary at position ${position}`);

        // Значение находится между началом буфера и boundary
        // Вычитаем 2 если есть \r\n перед boundary
        let valueEnd = position;
        if (hasCRLF) {
          valueEnd = position; // position уже указывает на \r\n
        }

        const value = this.buffer.slice(0, valueEnd).toString();

        console.log(
          `FIELD: extracted value length ${value.length}, preview: ${value.slice(0, 100)}`,
        );

        this.pendingFields.push({
          name: this.fieldName,
          value,
          truncated: false,
        });

        // Удаляем значение поля из буфера
        let bytesToRemove = valueEnd;
        if (hasCRLF) {
          bytesToRemove += 2; // Удаляем \r\n
        }

        this.buffer = this.buffer.slice(bytesToRemove);
        this.state = 'SEARCH';
        continue; // Продолжаем цикл для обработки следующей части
      }

      //
      // FILE
      //
      if (this.state === 'FILE') {
        const boundaryInfo = this.findNextBoundary(this.buffer, this.boundary);

        if (!boundaryInfo) {
          this.writeFileChunk(this.buffer);
          this.buffer = Buffer.alloc(0);
          return;
        }

        const { position, hasCRLF } = boundaryInfo;

        // Данные файла находятся между началом буфера и boundary
        let dataEnd = position;
        if (hasCRLF) {
          dataEnd = position; // position уже указывает на \r\n
        }

        const data = this.buffer.slice(0, dataEnd);
        this.writeFileChunk(data);

        this.fileStream?.end();

        const cd = this.parseContentDisposition(this.headers['content-disposition']);
        this.pendingFiles.push({
          name: this.fieldName,
          stream: this.fileStream!,
          info: {
            filename: cd.filename || '',
            mimeType: this.headers['content-type'] || 'application/octet-stream',
            encoding: '7bit',
            fileSize: this.fileSize,
          },
        });

        this.fileStream = null;
        // this.fileTemp = null;

        // Удаляем данные файла из буфера
        let bytesToRemove = dataEnd;
        if (hasCRLF) {
          bytesToRemove += 2; // Удаляем \r\n
        }

        this.buffer = this.buffer.slice(bytesToRemove);
        this.state = 'SEARCH';
        continue; // Продолжаем цикл
      }
    }
  }

  private findNextBoundary(
    buffer: Buffer,
    boundary: Buffer,
  ): {
    position: number;
    startPos: number;
    endPos: number;
    isClosing: boolean;
    hasCRLF: boolean;
  } | null {
    // Ищем boundary в буфере
    const pos = buffer.indexOf(boundary);
    if (pos === -1) return null;

    // Проверяем, является ли это closing boundary (--boundary--)
    const isClosing =
      buffer.length >= pos + boundary.length + 2 &&
      buffer[pos + boundary.length] === 45 && // '-'
      buffer[pos + boundary.length + 1] === 45; // '-'

    // Определяем начало части (позиция после предыдущего boundary)
    let startPos = pos;
    let hasCRLF = false;

    // Проверяем, есть ли перед boundary \r\n
    if (pos >= 2 && buffer[pos - 2] === 13 && buffer[pos - 1] === 10) {
      startPos = pos - 2;
      hasCRLF = true;
    } else if (pos >= 1 && buffer[pos - 1] === 10) {
      startPos = pos - 1;
      hasCRLF = false;
    }

    // Определяем конец boundary
    let endPos = pos + boundary.length;
    if (isClosing) endPos += 2;

    return {
      position: startPos,
      startPos,
      endPos,
      isClosing,
      hasCRLF,
    };
  }
}

export class NormalizeLineEndings extends Transform {
  private lastByte: number | null = null;

  _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback) {
    const out: number[] = [];

    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];

      if (byte === 0x0a && this.lastByte !== 0x0d) {
        out.push(0x0d, 0x0a);
      } else {
        out.push(byte);
      }

      this.lastByte = byte;
    }

    cb(null, Buffer.from(out));
  }
}
