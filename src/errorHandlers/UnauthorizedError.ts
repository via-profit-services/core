import { ErrorHandler } from './index';

export default class UnauthorizedError extends Error implements ErrorHandler {
  public metaData: {};

  public status: number;

  constructor(message: string, metaData?: {}) {
    super(message);

    this.name = 'UnauthorizedError';
    this.message = message;
    this.metaData = metaData;
    this.status = 401;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
