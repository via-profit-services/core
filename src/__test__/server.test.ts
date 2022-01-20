import path from 'node:path';
import fs from 'node:fs';

import configTest from './config-test';
import schema from './schema';

const { startServer, stopServer, request } = configTest({ schema });

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

describe('Graphql server', () => {
  // Check to response not contain errors field
  // Check to response contain data field
  // Check to response contain expected data
  test('GraphQL valid response must be valid', done => {
    const expectedData = {
      getFourAsString: 'four',
      getFourAsNumber: 4,
    };

    request<typeof expectedData>({
      body: JSON.stringify({
        query: 'query {getFourAsString, getFourAsNumber}',
        variables: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(typeof response.errors).toBe('undefined');
      expect(response.data).toEqual(expect.objectContaining(expectedData));
      done();
    });
  });
  // Deliberately false request
  // Check response contain errors
  test('Should return errors for non-nullable field Query.getFiveWithError', done => {
    const expectedData = [
      {
        message: 'Cannot return null for non-nullable field Query.getFiveWithError.',
        path: ['getFiveWithError'],
      },
    ];
    request<typeof expectedData>({
      body: JSON.stringify({
        query: 'query {getFiveWithError}',
        variables: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(typeof response.data).toBe('undefined');
      expect(response.errors).toBeInstanceOf(Object);
      expect(response.errors[0].path).toEqual(expectedData[0].path);
      expect(response.errors[0].message).toEqual(expectedData[0].message);
      done();
    });
  });

  test('Should return errors as cannot query field "nonDefined"', done => {
    const expectedData = [
      {
        message: 'Cannot query field "notDefined" on type "Query".',
      },
    ];
    request<typeof expectedData>({
      body: JSON.stringify({
        query: 'query {notDefined}',
        variables: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(typeof response.data).toBe('undefined');
      expect(response.errors).toBeInstanceOf(Object);
      expect(response.errors[0].message).toEqual(expectedData[0].message);
      done();
    });
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
    request({
      body,
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    }).then((response: any) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.uploadFiles[0].mimeType).toBe('image/jpeg');

      done();
    });
  });
});
