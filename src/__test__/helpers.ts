import { Readable } from 'node:stream';
import type http from 'node:http';

/**
 * Builds a minimal IncomingMessage-like stream.
 * Lets tests call the HTTP listener directly, without a real server,
 * and control exactly how the body is split into chunks.
 */
export const fakeRequest = (props: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  chunks?: Array<Buffer | string>;
}): http.IncomingMessage => {
  const { method = 'POST', url = '/graphql', headers = {}, chunks = [] } = props;
  const stream = Readable.from(chunks.map(c => (Buffer.isBuffer(c) ? c : Buffer.from(c))), {
    objectMode: false,
  }) as unknown as http.IncomingMessage;

  Object.assign(stream, { method, url, headers });

  return stream;
};

export const jsonRequest = (body: unknown, headers: Record<string, string> = {}) =>
  fakeRequest({
    headers: { 'content-type': 'application/json', ...headers },
    chunks: [JSON.stringify(body)],
  });

export const fakeResponse = () => ({}) as http.ServerResponse;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
