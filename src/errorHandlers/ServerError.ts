import { ErrorHandler } from './index';

export default class ServerError extends Error implements ErrorHandler {
  public metaData: {};

  public status: number;

  constructor(message: string, metaData?: {}) {
    super(message);

    this.name = 'ServerError';
    this.message = message;
    this.metaData = metaData;
    this.status = 500;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
