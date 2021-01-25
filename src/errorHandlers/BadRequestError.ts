import type { ErrorHandler } from '@via-profit-services/core';

export default class BadRequestError extends Error implements ErrorHandler {
  public metaData: any;

  public status: number;

  constructor(message: string, metaData?: any) {
    super(message);

    this.name = 'BadRequestError';
    this.message = message;
    this.metaData = metaData;
    this.status = 400;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
