import type { RequestBody, MultipartParser } from '@via-profit-services/core';
import busboy from 'busboy';

import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from './set';
import { DEFAULT_PERSISTED_QUERY_KEY } from '../constants';
import { TempFile } from './TempFile';

const multipartParser: MultipartParser = ({ request, config }) =>
  new Promise<RequestBody>((resolve, reject) => {
    const { persistedQueryKey, persistedQueriesMap, limits } = config;
    const { maxFieldSize, maxFileSize, maxFiles, maxFileFields, maxFileParts, maxFilesTotalSize } = limits;
    const { headers } = request;

    const parser = busboy({
      headers: {
        'content-type': 'multipart/form-data',
        ...headers,
      },
      limits: {
        fields: maxFileFields,
        fieldSize: maxFieldSize,
        fileSize: maxFileSize,
        files: maxFiles,
        parts: maxFileParts,
      },
    });

    const map = new Map<number, FileUploadInstance>();
    const operations: RequestBody = {};
    let totalSize = 0;

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
          reject(`Invalid JSON in the «operations» multipart field. ${err instanceof Error ? err.message : 'Unknown Error'}`);

          return;
        }

        // operations must be an object
        if (typeof parsed !== 'object') {
          reject(`«operations» multipart field must be an object. Got ${typeof parsed}`);

          return;
        }

        const { query, variables, operationName } = parsed;

        // variables must be an object
        if (typeof variables === 'object') {
          operations.variables = variables;
        }

        if (typeof operationName === 'string') {
          operations.operationName = operationName;
        }

        if (typeof query === 'string') {
          operations.query = query;
        }

        // persisted query
        if (
          typeof parsed[persistedQueryKey] === 'string' &&
          persistedQueriesMap[parsed[persistedQueryKey]]
        ) {
          operations.query = persistedQueriesMap[parsed[persistedQueryKey]];
        }

        // query must be a string
        if (typeof operations.query !== 'string') {
          reject(
            [
              `«operations.query» multipart field must be a string. Got ${typeof operations.query}.`,
              `if you use PersistedQuery, then the request must contain a key, for example, «${DEFAULT_PERSISTED_QUERY_KEY}» containing the ID of the request stored on the server`,
            ].join('\n'),
          );

          return;
        }

        if (typeof operations.variables !== 'object') {
          reject(
            `«operations.variables» multipart field must be an object. Got ${typeof operations.variables}`,
          );

          return;
        }
      }

      // MAP PARSER
      if (fieldName === 'map') {
        let mapData: Record<number, string[]>;
        try {
          mapData = JSON.parse(value);
        } catch (err) {
          reject(`Invalid JSON in the «map» field. ${err instanceof Error ? err.message : 'Unknown Error'}`);

          return;
        }

        if (Object.entries(mapData).length > maxFiles) {
          reject(`${maxFiles} max file uploads exceeded.`);

          return;
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

      const temp = new TempFile();


      // TOTAL SIZE LIMIT CHECK
      stream.on('data', chunk => {
        totalSize += chunk.length;

        if (totalSize > maxFilesTotalSize) {
          stream.unpipe();
          stream.resume();

          parser.emit(
            'error',
            new Error(`Total upload size exceeds the ${maxFilesTotalSize} byte limit.`),
          );
        }
      });


      stream.on('limit', () => {
        reject(`File truncated as it exceeds the ${maxFileSize} byte size limit.`);

        return;
      });

      stream.on('error', (_error: Error) => {
        stream.unpipe();
      });


      stream.on('data', chunk => temp.write(chunk));
      stream.on('end', async () => {
        await temp.end();
        upload.resolve({
          filename,
          mimeType,
          encoding,
          createReadStream: () => temp.createReadStream(),
          cleanup: () => temp.cleanup(),
        });
      });
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
