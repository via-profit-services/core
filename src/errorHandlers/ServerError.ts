import type { ErrorHandler } from '@via-profit-services/core';

export default class ServerError extends Error implements ErrorHandler {
  public metaData: any;

  public status: number;

  constructor(message: string, metaData?: any) {
    super(message);

    this.name = 'ServerError';
    this.message = message;
    this.metaData = metaData;
    this.status = 500;


    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
