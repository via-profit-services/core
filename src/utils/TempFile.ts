import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

export class TempFile {
  private readonly filePath: string;
  private writeStream: fs.WriteStream;
  private closed = false;

  constructor() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));

    // Generate a unique filename
    const filename = crypto.randomUUID();

    this.filePath = path.join(dir, filename);
    this.writeStream = fs.createWriteStream(this.filePath);

    this.writeStream.on('error', () => {
      // ignore, cleanup will handle it
    });
  }

  write(chunk: Buffer) {
    if (this.closed) {
      throw new Error('Cannot write to closed TempFile');
    }
    return this.writeStream.write(chunk);
  }

  end() {
    return new Promise<void>(resolve => {
      const ws = this.writeStream;

      const onClose = () => {
        ws.removeListener('error', onError);
        this.closed = true;
        resolve();
      };

      const onError = () => {
        // игнорируем, cleanup всё удалит
      };

      ws.once('close', onClose);
      ws.on('error', onError);

      ws.end();
    });
  }

  createReadStream() {
    if (!this.closed) {
      throw new Error('Cannot create read stream before file is closed');
    }

    const stream = fs.createReadStream(this.filePath);

    stream.on('error', err => {
      if ('code' in err && err.code === 'ENOENT') {
        // файл уже удалён — просто тихо гасим поток
        stream.destroy();
        return;
      }

      // остальные ошибки по-прежнему можно логировать или гасить
      stream.destroy();
    });

    return stream;
  }

  cleanup() {
    try {
      fs.unlinkSync(this.filePath);
    } catch {
      // do nothing
    }

    try {
      fs.rmdirSync(path.dirname(this.filePath));
    } catch {
      // do nothing
    }
  }
}
