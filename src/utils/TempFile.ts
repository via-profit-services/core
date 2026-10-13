import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadStreamOptions } from '@via-profit-services/core';

/**
 * A temporary file that buffers an uploaded file on disk.
 *
 * Why disk and not memory: an upload may be hundreds of megabytes, and many
 * uploads may run at once. On disk the memory usage per upload stays at the
 * size of a stream buffer (~64 KB).
 *
 * Security:
 *   - the name is a random UUID: it cannot be guessed or chosen by a client;
 *   - the file is created with the `wx` flag (fails if the path exists, so a
 *     pre-created symlink cannot redirect the write) and mode 0600
 *     (readable only by the server user).
 *
 * All file system calls are asynchronous: sync calls (`mkdtempSync`,
 * `unlinkSync`...) block the event loop and all other requests with it.
 */
export class TempFile {
  public readonly filePath: string;
  private readonly writeStream: fs.WriteStream;
  private readonly closedPromise: Promise<void>;
  private closed = false;
  private cleaned = false;
  private writeError: Error | null = null;

  constructor(directory: string = os.tmpdir()) {
    this.filePath = path.join(directory, `via-profit-upload-${crypto.randomUUID()}`);
    this.writeStream = fs.createWriteStream(this.filePath, { flags: 'wx', mode: 0o600 });

    this.closedPromise = new Promise<void>(resolve => {
      this.writeStream.once('close', () => resolve());
    });

    this.writeStream.on('error', err => {
      this.writeError = err;
    });
  }

  /**
   * Writes a whole stream into the file (with backpressure) and closes it.
   * Resolves with the number of written bytes.
   */
  async writeFrom(source: Readable): Promise<number> {
    if (this.closed) {
      throw new Error('Cannot write to closed TempFile');
    }

    this.closed = true;
    await pipeline(source, this.writeStream);

    return this.writeStream.bytesWritten;
  }

  /**
   * Writes a chunk to the temp file.
   * Throws if the file is already closed.
   */
  write(chunk: Buffer) {
    if (this.closed) {
      throw new Error('Cannot write to closed TempFile');
    }

    return this.writeStream.write(chunk);
  }

  /**
   * Finalizes the file. Safe to call several times and after cleanup().
   */
  async end(): Promise<void> {
    if (!this.closed) {
      this.closed = true;
      this.writeStream.end();
    }

    await this.closedPromise;

    if (this.writeError && !this.cleaned) {
      throw this.writeError;
    }
  }

  /**
   * Creates a read stream for the temp file.
   * Only allowed after the file is closed and before cleanup().
   * Read errors are delivered to the consumer as usual stream errors.
   */
  createReadStream(options?: ReadStreamOptions) {
    if (!this.closed) {
      throw new Error('Cannot create read stream before file is closed');
    }

    if (this.cleaned) {
      throw new Error(
        'The uploaded file was already removed. Read it before the HTTP response is sent or copy it',
      );
    }

    return fs.createReadStream(this.filePath, options);
  }

  /**
   * Removes the temp file. Safe to call multiple times.
   *
   * Already opened read streams keep working on Linux/macOS: the data is
   * released by the OS when the last descriptor is closed.
   */
  cleanup() {
    if (this.cleaned) {
      return;
    }
    this.cleaned = true;

    const unlink = () => {
      fs.unlink(this.filePath, () => {
        // the file may be already removed or never created
      });
    };

    if (this.writeStream.closed) {
      unlink();

      return;
    }

    // The file is opened asynchronously. Removing it before the stream is
    // closed may race with the creation of the file and leave it on disk.
    this.writeStream.once('close', unlink);
    this.writeStream.destroy();
  }
}
