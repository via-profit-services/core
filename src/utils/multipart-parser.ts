import type { RequestBody, MultipartParser } from '@via-profit-services/core';
import busboy from 'busboy';

import { WriteStream, ReadStreamOptions } from '../fs-capacitor';
import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from './set';

const multipartParser: MultipartParser = ({ request, config }) =>
  new Promise<RequestBody>((resolve, reject) => {
    const { persistedQueryKey, maxFieldSize, maxFileSize, maxFiles } = config;
    const { headers } = request;

    const parser = busboy({
      headers: {
        'content-type': 'multipart/form-data',
        ...headers,
      },
      limits: {
        fields: 2, // Only operations and map.
        fieldSize: maxFieldSize,
        fileSize: maxFileSize,
        files: maxFiles,
      },
    });

    const map = new Map<number, FileUploadInstance>();
    const operations: RequestBody = {};

    // FIELD PARSER
    parser.on('field', (fieldName, value, { valueTruncated }) => {
      if (valueTruncated) {
        reject(
          `The «${fieldName}» multipart field value exceeds the ${maxFieldSize} byte size limit.`,
        );

        return;
      }

      if (fieldName === 'operations') {
        // try to parse operations field
        let parsed: any = {};
        try {
          parsed = JSON.parse(value);
        } catch (err) {
          reject('Invalid JSON in the «operations» multipart field');

          return;
        }

        // operations must be an object
        if (typeof parsed !== 'object') {
          reject(`«operations» multipart field must be an object. Got ${typeof parsed}`);

          return;
        }

        const { query, variables, operationName } = parsed;

        // query must be a string
        if (typeof query === 'string') {
          operations.query = query;
        } else {
          reject(
            `«operations.query» multipart field must be a string. Got ${typeof operations.query}`,
          );

          return;
        }

        // variables must be an object
        if (typeof variables === 'object') {
          operations.variables = variables;
        } else {
          reject(
            `«operations.variables» multipart field must be an object. Got ${typeof operations.variables}`,
          );

          return;
        }

        if (typeof operationName === 'string') {
          operations.operationName = operationName;
        }

        // documentId field
        if (typeof parsed[persistedQueryKey] === 'string') {
          operations[persistedQueryKey] = parsed[persistedQueryKey];
        }
      }

      // MAP PARSER
      if (fieldName === 'map') {
        let mapData: Record<number, string[]>;
        try {
          mapData = JSON.parse(value);
        } catch (error) {
          reject('Invalid JSON in the «map» field');

          return;
        }

        if (Object.entries(mapData).length > maxFiles) {
          reject(`${maxFiles} max file uploads exceeded.`);
        }

        Object.entries(mapData).forEach(([fieldName, paths]) => {
          if (!Array.isArray(paths)) {
            reject(`Invalid type for the «map» multipart field entry key «${fieldName}» array.`);

            return;
          }

          map.set(Number(fieldName), new FileUploadInstance());

          paths.forEach((pathValue, pathIndex) => {
            if (typeof pathValue !== 'string') {
              reject(
                `Invalid type for the «map» multipart field entry key «${fieldName}» array index «${pathIndex}» value`,
              );

              return;
            }

            dotNotationSet(operations, pathValue, map.get(Number(fieldName)));
          });
        });
      }
    });

    // FILE PARSER
    parser.on('file', (fieldName, stream, { filename, mimeType, encoding }) => {
      const upload = map.get(Number(fieldName));

      if (!upload) {
        reject(`File from field «${fieldName}» are not registered in map field`);

        return;
      }

      if (!upload?.resolve) {
        reject(`File from field «${fieldName}» are not registered in map field`);

        return;
      }

      const capacitor = new WriteStream();
      capacitor.on('error', () => {
        stream.unpipe();
        stream.resume();
      });

      stream.on('limit', () => {
        reject(`File truncated as it exceeds the ${maxFileSize} byte size limit.`);

        return;
      });

      stream.on('error', (_error: Error) => {
        stream.unpipe();
        capacitor.destroy(new Error('Upload error'));
        capacitor.destroy();
      });

      const file: any = {
        filename,
        mimeType,
        encoding,
        capacitor,
        createReadStream: (opt?: ReadStreamOptions) => capacitor.createReadStream(opt),
      };

      Object.defineProperty(file, 'capacitor', { value: capacitor });
      stream.pipe(capacitor);
      upload.resolve(file);
    });

    // FILES LIMIT PARSER
    parser.once('filesLimit', () => {
      reject(`${Infinity} max file uploads exceeded.`);

      return;
    });

    // FINISH PARSER
    parser.once('finish', () => {
      request.unpipe(parser);
      request.resume();

      if (operations === null) {
        reject('Missing multipart field «operations»');

        return;
      }

      if (!map.size) {
        reject('Missing multipart field «map»');

        return;
      }

      resolve(operations);
    });

    parser.once('error', (err: any) => {
      reject(err);
    });

    request.pipe(parser);
  });

export default multipartParser;
