import type { RequestBody, MultipartParser } from '@via-profit-services/core';
import busboy from 'busboy';

import { WriteStream, ReadStreamOptions } from '../fs-capacitor';
import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from '../utils/set';

const multipartParser: MultipartParser = ({ request, config }) =>
  new Promise<RequestBody>(resolve => {
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
    parser.on('field', (fieldName, value, _fieldNameTruncated, valueTruncated) => {
      if (valueTruncated) {
        throw new Error(
          `The «${fieldName}» multipart field value exceeds the ${maxFieldSize} byte size limit.`,
        );
      }

      if (fieldName === 'operations') {
        // try to parse operations field
        let parsed: any = {};
        try {
          parsed = JSON.parse(value);
        } catch (err) {
          throw new Error('Invalid JSON in the «operations» multipart field');
        }

        // operations must be an object
        if (typeof parsed !== 'object') {
          throw new Error(`«operations» multipart field must be an object. Got ${typeof parsed}`);
        }

        const { query, variables, operationName } = parsed;

        // query must be a string
        if (typeof query === 'string') {
          operations.query = query;
        } else {
          throw new Error(
            `«operations.query» multipart field must be a string. Got ${typeof operations.query}`,
          );
        }

        // variables must be an object
        if (typeof variables === 'object') {
          operations.variables = variables;
        } else {
          throw new Error(
            `«operations.variables» multipart field must be an object. Got ${typeof operations.variables}`,
          );
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
          throw new Error('Invalid JSON in the «map» field');
        }

        if (Object.entries(mapData).length > maxFiles) {
          throw new Error(`${maxFiles} max file uploads exceeded.`);
        }

        Object.entries(mapData).forEach(([fieldName, paths]) => {
          if (!Array.isArray(paths)) {
            throw new Error(
              `Invalid type for the «map» multipart field entry key «${fieldName}» array.`,
            );
          }

          map.set(Number(fieldName), new FileUploadInstance());

          paths.forEach((pathValue, pathIndex) => {
            if (typeof pathValue !== 'string') {
              throw new Error(
                `Invalid type for the «map» multipart field entry key «${fieldName}» array index «${pathIndex}» value`,
              );
            }

            dotNotationSet(operations, pathValue, map.get(Number(fieldName)));
          });
        });
      }
    });

    // FILE PARSER
    parser.on('file', (fieldName, stream, info) => {
      const { mimeType, encoding, filename } = info as any;
      const upload = map.get(Number(fieldName));

      if (!upload) {
        throw new Error(`File from field «${fieldName}» are not registered in map field`);
      }

      if (!upload?.resolve) {
        throw new Error(`File from field «${fieldName}» are not registered in map field`);
      }

      const capacitor = new WriteStream();
      capacitor.on('error', () => {
        stream.unpipe();
        stream.resume();
      });

      stream.on('limit', () => {
        throw new Error(`File truncated as it exceeds the ${maxFileSize} byte size limit.`);
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
      throw new Error(`${Infinity} max file uploads exceeded.`);
    });

    // FINISH PARSER
    parser.once('finish', () => {
      request.unpipe(parser);
      request.resume();

      if (operations === null) {
        throw new Error('Missing multipart field «operations»');
      }

      if (!map.size) {
        throw new Error('Missing multipart field «map»');
      }

      resolve(operations);
    });

    parser.once('error', (err: any) => {
      throw new Error(`Unknown error ${err}`);
    });

    request.pipe(parser);
  });

export default multipartParser;
