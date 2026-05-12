import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { ReadStreamOptions } from '@via-profit-services/core';

/**
 * Represents a temporary file used to buffer uploaded file data.
 *
 * Guarantees:
 *   - Safe creation of a unique temp directory and file
 *   - Writes are rejected after the file is closed
 *   - end() resolves only once
 *   - cleanup() is idempotent and safe to call multiple times
 *   - createReadStream() works only after end()
 */
export class TempFile {
  private readonly filePath: string;
  private writeStream: fs.WriteStream;
  private closed = false;
  private cleaned = false;

  constructor() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));
    const filename = crypto.randomUUID();

    this.filePath = path.join(dir, filename);
    this.writeStream = fs.createWriteStream(this.filePath);

    this.writeStream.on('error', err => {
      console.error(err);
      // Errors are handled by end() / cleanup()
    });
  }

  /**
   * Writes a chunk to the temp file.
   * Throws if the file is already closed.
   */
  write(chunk: Buffer) {
    console.log('[TempFile] write chunk:', chunk.length);
    if (this.closed) {
      throw new Error('Cannot write to closed TempFile');
    }


    return this.writeStream.write(chunk);
  }

  /**
   * Finalizes the file.
   * Ensures the write stream is closed exactly once.
   */
  end(): Promise<void> {
    console.log('[TempFile] end() called');
    if (this.closed) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      const ws = this.writeStream;

      const onClose = () => {
        ws.removeListener('error', onError);
        this.closed = true;
        resolve();
      };

      const onError = () => {
        console.error('onError');
        // Ignore — cleanup() will remove the file anyway
      };

      ws.once('close', onClose);
      ws.on('error', onError);

      ws.end();
    });
  }

  /**
   * Creates a read stream for the temp file.
   * Only allowed after the file is closed.
   */
  createReadStream() {
    if (!this.closed) {
      throw new Error('Cannot create read stream before file is closed');
    }

    const stream = fs.createReadStream(this.filePath);

    stream.on('error', err => {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
        // File already removed — silently destroy
        stream.destroy();
        return;
      }

      // Other errors can be logged or handled upstream
      stream.destroy();
    });

    return stream;
  }

  /**
   * Removes the temp file and its directory.
   * Safe to call multiple times.
   */
  cleanup() {
    if (this.cleaned) {
      return;
    }
    this.cleaned = true;

    try {
      fs.unlinkSync(this.filePath);
    } catch {
      // File may already be removed
    }

    try {
      fs.rmdirSync(path.dirname(this.filePath));
    } catch {
      // Directory may already be removed
    }
  }
}
