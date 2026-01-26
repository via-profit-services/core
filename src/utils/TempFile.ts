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
  }

  write(chunk: Buffer) {
    if (this.closed) {
      throw new Error('Cannot write to closed TempFile');
    }
    return this.writeStream.write(chunk);
  }

  end() {
    return new Promise<void>(resolve => {
      this.writeStream.end(() => {
        this.closed = true;
        resolve();
      });
    });
  }

  createReadStream() {
    if (!this.closed) {
      throw new Error('Cannot create read stream before file is closed');
    }
    return fs.createReadStream(this.filePath);
  }

  cleanup() {
    try {
      fs.unlinkSync(this.filePath);
      fs.rmdirSync(path.dirname(this.filePath));
    } catch {
      // ignore
    }
  }
}
