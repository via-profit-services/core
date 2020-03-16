import { ErrorHandler } from './index';

export default class NotFoundError extends Error implements ErrorHandler {
  public metaData: {};

  public status: number;

  constructor(message: string, metaData?: {}) {
    super(message);

    this.name = 'NotFoundError';
    this.message = message;
    this.metaData = metaData;
    this.status = 404;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
