declare module 'http' {
  import { Context } from '@via-profit-services/core';
  export interface IncomingMessage {
    context: Context;
  }
}
