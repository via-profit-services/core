import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { URL } from 'node:url';

import configTest from './config-test';
import schema from './schema';

const port = 8083;
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
      `http://localhost:${port}/${endpoint}?query=query TestSuccessQuery {getFourAsString getFourAsNumber}`,
    );

    http.get(url, res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        const response = Buffer.concat(buffers).toString();
        const { data, errors } = JSON.parse(response);

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('application/json');
        expect(errors).toBeUndefined();
        expect(data.getFourAsString).toBe('four');
        expect(data.getFourAsNumber).toBe(4);

        done();
      });

      res.on('error', err => {
        done(err);
      });
    });
  });


  test('POST request with Content-Type headers should be passed successfully', done => {
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    req.on('response', res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        const response = Buffer.concat(buffers).toString();

        let parsed;
        try {
          parsed = JSON.parse(response);
        } catch (err) {
          return done(err);
        }

        const { data, errors } = parsed;

        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data.getFourAsString).toBe('four');
          expect(data.getFourAsNumber).toBe(4);
          done();
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));

    req.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );

    req.end();
  });


  test('GET request with wrong query string params should be broken', done => {
    const url = new URL(
      `http://localhost:${port}/graphql?quEry={getFourAsString, getFourAsNumber}`,
    );

    const req = http.get(url, res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        let parsed;

        try {
          const text = Buffer.concat(buffers).toString();
          parsed = JSON.parse(text);
        } catch (err) {
          return done(err);
        }

        const { data, errors } = parsed;

        try {
          expect(res.statusCode).toBe(400);
          expect(res.headers['content-type']).toBe('application/json');
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
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));
  });



  test('POST request without Content-Type headers should be braking', done => {
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
    });

    req.on('response', res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        let parsed;

        try {
          const text = Buffer.concat(buffers).toString();
          parsed = JSON.parse(text);
        } catch (err) {
          return done(err);
        }

        const { data, errors } = parsed;

        try {
          expect(res.statusCode).toBe(400);
          expect(res.headers['content-type']).toBe('application/json');
          expect(data).toBeUndefined();
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Missing Content-Type header',
              }),
            ]),
          );
          done();
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));

    req.write(
      JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
    );

    req.end();
  });


  test('POST request with OPTIONAL method should be skipped', done => {
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'OPTIONS',
    });

    req.on('response', res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        const response = Buffer.concat(buffers).toString();

        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBeUndefined();
          expect(response).toBe('');
          done();
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));

    // ВАЖНО: никаких request.write() для OPTIONS
    req.end();
  });


  test('Echo mutation should returns passed string', done => {
    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    req.on('response', res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        let parsed;

        try {
          const text = Buffer.concat(buffers).toString();
          parsed = JSON.parse(text);
        } catch (err) {
          return done(err);
        }

        const { errors, data } = parsed;

        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data).toEqual(
            expect.objectContaining({
              echo: 'Hello',
            }),
          );
          done();
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));

    req.write(
      JSON.stringify({
        query: 'mutation {echo(str: "Hello")}',
        variables: {},
      }),
    );

    req.end();
  });

  test('Upload file', done => {
    const boundary = 'WebKitFormBoundaryAgKamWkoQPsg9ANs'; // без "--"

    const operations = JSON.stringify({
      query:
        'mutation UploadFiles($filesList: [FileUpload!]!) {uploadFiles(filesList: $filesList) {location mimeType}}',
      variables: { filesList: [null] },
      operationName: 'UploadFiles',
    });

    const map = JSON.stringify({ 0: ['variables.filesList.0'] });

    const sourceFilename = path.resolve(__dirname, '../../assets/file-to-upload.jpeg');
    const fileData = fs.readFileSync(sourceFilename);

    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="operations"\r\n\r\n` +
          `${operations}\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="map"\r\n\r\n` +
          `${map}\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="0"; filename="${path.basename(sourceFilename)}"\r\n` +
          `Content-Type: image/jpeg\r\n\r\n`,
      ),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const req = http.request({
      port,
      path: endpoint,
      hostname: 'localhost',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    });

    req.on('response', res => {
      const buffers: Buffer[] = [];

      res.on('data', chunk => buffers.push(chunk));

      res.on('end', () => {
        let parsed;

        try {
          parsed = JSON.parse(Buffer.concat(buffers).toString());
        } catch (err) {
          return done(err);
        }

        const { data, errors } = parsed;

        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('application/json');
          expect(errors).toBeUndefined();
          expect(data.uploadFiles[0].mimeType).toBe('image/jpeg');
          done();
        } catch (err) {
          done(err);
        }
      });

      res.on('error', err => done(err));
    });

    req.on('error', err => done(err));

    req.write(body);
    req.end();
  });

});
