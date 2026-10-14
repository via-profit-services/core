import type { FilePayload } from './types';

/**
 * A global symbol (registered via Symbol.for) is the same in every copy of
 * this package. `instanceof` is not reliable here: the package ships ESM and
 * CJS builds, and if an application loads both (e.g. its code uses `import`
 * while a dependency uses `require`), there are two different
 * FileUploadInstance classes and `instanceof` returns false.
 */
const FILE_UPLOAD_INSTANCE = Symbol.for('@via-profit-services/core/FileUploadInstance');

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
    Object.defineProperty(this, FILE_UPLOAD_INSTANCE, { value: true });

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

  /**
   * true when the upload was resolved or rejected
   */
  get finished(): boolean {
    return this._finished;
  }

  static isFileUploadInstance(value: unknown): value is FileUploadInstance {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<symbol, unknown>)[FILE_UPLOAD_INSTANCE] === true
    );
  }
}

export default FileUploadInstance;
