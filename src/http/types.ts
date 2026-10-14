import type http from 'node:http';

import type { Configuration } from '../application/types';

export type RequestBody = {
  operationName?: unknown;
  query?: unknown;
  variables?: Record<string, unknown>;
  [key: string]: unknown;
};

export type BodyParser = (props: {
  request: http.IncomingMessage;
  response: http.ServerResponse;
  config: Configuration;
}) => Promise<RequestBody>;
