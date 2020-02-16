import { ErrorHandler } from './index';

export default class ForbiddenError extends Error implements ErrorHandler {
  public metaData: {};

  public status: number;

  constructor(message: string, metaData?: {}) {
    super(message);

    this.name = 'ForbiddenError';
    this.message = message;
    this.metaData = metaData;
    this.status = 503;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
