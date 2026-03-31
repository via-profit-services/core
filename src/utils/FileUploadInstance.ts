import type { FilePayload } from '@via-profit-services/core';

/**
 * Represents a single file upload placeholder used by the GraphQL multipart protocol.
 *
 * This instance exposes:
 *   - promise: resolves when the file is fully received
 *   - resolve(file): marks the upload as completed
 *   - reject(error): marks the upload as failed
 *
 * It guarantees:
 *   - resolve/reject can be called only once
 *   - unhandled rejections are suppressed
 *   - file payload is stored safely
 */
class FileUploadInstance {
  public readonly promise: Promise<FilePayload>;
  public resolve!: (file: FilePayload) => void;
  public reject!: (err: unknown) => void;

  private _file: FilePayload | null = null;
  private _finished = false;

  constructor() {
    this.promise = new Promise<FilePayload>((resolve, reject) => {
      this.resolve = (file: FilePayload) => {
        if (this._finished) return;
        this._finished = true;
        this._file = file;
        resolve(file);
      };

      this.reject = (err: unknown) => {
        if (this._finished) return;
        this._finished = true;
        reject(err instanceof Error ? err : new Error(String(err)));
      };
    });

    // Prevent unhandled rejection warnings
    this.promise.catch(() => {});
  }

  /**
   * Returns the resolved file payload if available.
   */
  get file(): FilePayload | null {
    return this._file;
  }
}

export default FileUploadInstance;
