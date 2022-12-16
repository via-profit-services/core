import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { URL } from 'node:url';

import configTest from './config-test';
import schema from './schema';

const port = 8080;
const endpoint = '/graphql';
const { startServer, stopServer } = configTest({ schema, port, endpoint });

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

describe('Graphql server', () => {
  test('GET request with query key params should be passed successfully', done => {
    const url = new URL(
      `http://localhost:8080/graphql?query=query TestSuccessQuery {getFourAsString getFourAsNumber}`,
    );
    const request = http.request(url, socket => {
      const buffers: Buffer[] = [];
      socket.on('data', chunk => buffers.push(chunk));
      socket.on('end', () => {
        const response = Buffer.concat(buffers).toString();
        const { data, errors } = JSON.parse(response);

        expect(socket.statusCode).toBe(200);
        expect(socket.headers['content-type']).toBe('application/json');
        expect(errors).toBeUndefined();
        expect(data.getFourAsString).toBe('four');
        expect(data.getFourAsNumber).toBe(4);

        done();
      });
    });

    request.end();
  });

  test('POST request with Content-Type headers should be passed successfully', done => {
    const request = http.request(
      {
        port,
        path: endpoint,
        hostname: 'localhost',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { data, errors } = JSON.parse(response);

          expect(socket.statusCode).toBe(200);
          expect(socket.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data.getFourAsString).toBe('four');
          expect(data.getFourAsNumber).toBe(4);

          done();
        });
      },
    );
    request.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );
    request.end();
  });

  test('GET request with wrong query string params should be broken', done => {
    const url = new URL('http://localhost:8080/graphql?quEry={getFourAsString, getFourAsNumber}');
    const request = http.request(url, socket => {
      const buffers: Buffer[] = [];
      socket.on('data', chunk => buffers.push(chunk));
      socket.on('end', () => {
        const response = Buffer.concat(buffers).toString();
        const { data, errors } = JSON.parse(response);

        expect(socket.statusCode).toBe(200);
        expect(socket.headers['content-type']).toBe('application/json');
        expect(data).toBeUndefined();
        expect(errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              extensions: expect.objectContaining({
                errorType: 'graphql-error-validate-request',
              }),
            }),
          ]),
        );

        done();
      });
    });
    request.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );
    request.end();
  });

  test('POST request without Content-Type headers should be braking', done => {
    const request = http.request(
      {
        port,
        path: endpoint,
        hostname: 'localhost',
        method: 'POST',
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { data, errors } = JSON.parse(response);

          expect(socket.statusCode).toBe(200);
          expect(socket.headers['content-type']).toBe('application/json');
          expect(data).toBeUndefined();
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Missing Content-Type header',
              }),
            ]),
          );

          done();
        });
      },
    );
    request.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );
    request.end();
  });

  test('POST request with OPTIONAL method should be skipped', done => {
    const request = http.request(
      {
        port,
        path: endpoint,
        hostname: 'localhost',
        method: 'OPTIONS',
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          expect(socket.statusCode).toBe(200);
          expect(socket.headers['content-type']).toBeUndefined();
          expect(response).toBe('');

          done();
        });
      },
    );
    request.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );
    request.end();
  });

  test('Echo mutation should returns passed string', done => {
    const request = http.request(
      {
        port,
        path: endpoint,
        hostname: 'localhost',
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { errors, data } = JSON.parse(response);
          expect(socket.statusCode).toBe(200);
          expect(socket.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data).toEqual(
            expect.objectContaining({
              echo: 'Hello',
            }),
          );

          done();
        });
      },
    );
    request.write(
      JSON.stringify({
        query: 'mutation {echo(str: "Hello")}',
        variables: {},
      }),
    );
    request.end();
  });

  test('Upload file', done => {
    const boundary = '--WebKitFormBoundaryAgKamWkoQPsg9ANs';
    const operations = JSON.stringify({
      query:
        'mutation UploadFiles($filesList: [FileUpload!]!) {uploadFiles(filesList: $filesList) {location mimeType}}',
      variables: { filesList: [null] },
      operationName: 'UploadFiles',
    });
    const map = JSON.stringify({ 0: ['variables.filesList.0'] });
    const sourceFilename = path.resolve(__dirname, '../../assets/file-to-upload.jpeg');
    const fileData = fs.readFileSync(sourceFilename);

    const buffers: Buffer[] = [
      Buffer.from(
        [
          `--${boundary}`,
          '\r\n',
          'Content-Disposition: form-data; name="operations"',
          '\r\n',
          '\r\n',
          operations,
          '\r\n',
          `--${boundary}`,
          '\r\n',
          'Content-Disposition: form-data; name="map"',
          '\r\n',
          '\r\n',
          map,
          '\r\n',
          `--${boundary}`,
          '\r\n',
          `Content-Disposition: form-data; name="0"; filename="${path.basename(sourceFilename)}"`,
          '\r\n',
          'Content-Type: image/jpeg',
          '\r\n',
          '\r\n',
        ].join(''),
      ),
      Buffer.from(fileData),
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'),
    ];

    const body = Buffer.concat(buffers);
    const request = http.request(
      {
        port,
        path: endpoint,
        hostname: 'localhost',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
      },
      socket => {
        const buffers: Buffer[] = [];
        socket.on('data', chunk => buffers.push(chunk));
        socket.on('end', () => {
          const response = Buffer.concat(buffers).toString();
          const { data, errors } = JSON.parse(response);

          expect(socket.statusCode).toBe(200);
          expect(socket.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data.uploadFiles[0].mimeType).toBe('image/jpeg');

          done();
        });
      },
    );
    request.write(body);
    request.end();
  });
});
