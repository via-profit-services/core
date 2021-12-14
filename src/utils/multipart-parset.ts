import type { RequestBody, MultipartParser } from '@via-profit-services/core';
import { WriteStream } from 'fs-capacitor';
import Busboy from 'busboy';

import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from '../utils/set';

const multipartParser: MultipartParser = ({ request, configurtation }) =>
  new Promise<RequestBody>(resolve => {
    const { persistedQueryKey } = configurtation;
    const { headers } = request;

    const parser = new Busboy({
      headers: {
        'content-type': 'multipart/form-data',
        ...headers,
      },
      limits: {
        fields: 2, // Only operations and map.
        // ...limits, // FIXME: Set limits
      },
    });

    const map = new Map<number, FileUploadInstance>();
    const operations: RequestBody = {};

    // FIELD PARSER
    parser.on('field', (fieldName, value, _fieldNameTruncated, valueTruncated) => {
      if (valueTruncated) {
        throw new Error(
          `The «${fieldName}» multipart field value exceeds the ${1000000 * 64} byte size limit.`,
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

        // FIXME: Set  max files limit
        if (Object.entries(mapData).length > 30) {
          throw new Error(`${30} max file uploads exceeded.`);
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

            // operations.variables.files[fieldName] = map.get(Number(fieldName));
            // operations.variables

            // operations.variables[]

            // .set(pathValue, map.get(Number(fieldName)));
          });
        });
      }
    });

    // FILE PARSER
    parser.on('file', (fieldName, stream, filename, encoding, mimeType) => {
      // console.log('File detected')
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
        throw new Error(`File truncated as it exceeds the ${Infinity} byte size limit.`);
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
        // id: uuidv4(),
        // FIXME: Resolve types
        createReadStream: (options?: any) => capacitor.createReadStream(options) as any,
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
      // console.log('finished')
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
