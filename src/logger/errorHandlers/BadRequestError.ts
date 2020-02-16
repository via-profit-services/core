import { ErrorHandler } from './index';

export default class BadRequestError extends Error implements ErrorHandler {
  public metaData: {};

  public status: number;

  constructor(message: string, metaData?: {}) {
    super(message);

    this.name = 'BadRequestError';
    this.message = message;
    this.metaData = metaData;
    this.status = 400;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
