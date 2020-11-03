import { ErrorHandler } from './index';

export default class ForbiddenError extends Error implements ErrorHandler {
  public metaData: any;

  public status: number;

  constructor(message: string, metaData?: any) {
    super(message);

    this.name = 'ForbiddenError';
    this.message = message;
    this.metaData = metaData;
    this.status = 403;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
