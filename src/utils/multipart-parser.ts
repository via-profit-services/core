import type { RequestBody, MultipartParser } from '@via-profit-services/core';

import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from './set';
import { DEFAULT_PERSISTED_QUERY_KEY } from '../constants';
import { TempFile } from './TempFile';
import { Multipart } from './Multipart';

const validateMapPath = (obj: any, path: string): boolean => {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
};

const multipartParser: MultipartParser = ({ request, config }) =>
  new Promise<RequestBody>((resolve, reject) => {
    const { persistedQueryKey, persistedQueriesMap, limits } = config;
    const { maxFieldSize, maxFileSize, maxFiles, maxFilesTotalSize } =
      limits;
    const { headers } = request;

    let finished = false;
    const safeReject = (err: any) => {
      if (finished) {
        return;
      }
      finished = true;
      reject(err);
    };
    const safeResolve = (value: any) => {
      if (finished) {
        return;
      }
      finished = true;
      resolve(value);
    };

    if (!headers?.['content-type']?.includes('multipart/form-data')) {
      safeReject('Invalid content-type for multipart');
      return;
    }

    const parser = new Multipart({
      headers,
      limits,
    });

    request.on('close', () => {
      parser.destroy(new Error('Request closed unexpectedly'));
    });

    const map = new Map<number, FileUploadInstance>();
    const operations: RequestBody = {};
    let totalSize = 0;

    // FIELD PARSER
    let operationsReceived = false;
    parser.on('field', (fieldName, value, { valueTruncated }) => {
      if (valueTruncated) {
        safeReject(
          `The «${fieldName}» multipart field value exceeds the ${maxFieldSize} byte size limit.`,
        );

        return;
      }

      if (fieldName === 'operations') {
        if (operationsReceived) {
          safeReject('Multiple "operations" fields are not allowed.');
          return;
        }
        operationsReceived = true;

        // try to parse operations field
        let parsed: any = {};
        try {
          parsed = JSON.parse(value);
        } catch (err) {
          safeReject(
            `Invalid JSON in the «operations» multipart field. ${err instanceof Error ? err.message : 'Unknown Error'}`,
          );

          return;
        }

        // operations must be an object
        if (typeof parsed !== 'object') {
          safeReject(`«operations» multipart field must be an object. Got ${typeof parsed}`);

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
          safeReject(
            [
              `«operations.query» multipart field must be a string. Got ${typeof operations.query}.`,
              `if you use PersistedQuery, then the request must contain a key, for example, «${DEFAULT_PERSISTED_QUERY_KEY}» containing the ID of the request stored on the server`,
            ].join('\n'),
          );

          return;
        }

        if (typeof operations.variables !== 'object') {
          safeReject(
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
          safeReject(
            `Invalid JSON in the «map» field. ${err instanceof Error ? err.message : 'Unknown Error'}`,
          );

          return;
        }

        if (Object.entries(mapData).length > maxFiles) {
          safeReject(`${maxFiles} max file uploads exceeded.`);

          return;
        }

        Object.entries(mapData).forEach(([fieldName, paths]) => {
          if (!Array.isArray(paths)) {
            safeReject(
              `Invalid type for the «map» multipart field entry key «${fieldName}» array.`,
            );

            return;
          }

          map.set(Number(fieldName), new FileUploadInstance());

          paths.forEach((pathValue, pathIndex) => {
            if (typeof pathValue !== 'string') {
              safeReject(
                `Invalid type for the «map» multipart field entry key «${fieldName}» array index «${pathIndex}» value`,
              );
              return;
            }

            if (!validateMapPath(operations, pathValue)) {
              safeReject(`Invalid map path: «${pathValue}»`);
              return;
            }

            dotNotationSet(operations, pathValue, map.get(Number(fieldName)));
          });
        });
      }
    });

    request.on('aborted', () => {
      parser.emit('error', new Error('Request aborted by client'));
    });

    // FILE PARSER
    parser.on('file', (fieldName, stream, { filename, mimeType, encoding }) => {
      stream.on('error', () => {
        safeReject(new Error('File stream error'));
      });
      const upload = map.get(Number(fieldName));

      if (!upload) {
        safeReject(`File from field «${fieldName}» are not registered in map field`);

        return;
      }

      if (!upload?.resolve) {
        safeReject(`File from field «${fieldName}» are not registered in map field`);

        return;
      }

      const temp = new TempFile();

      // TOTAL SIZE LIMIT CHECK
      stream.on('data', (chunk: Buffer) => {
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
        safeReject(`File truncated as it exceeds the ${maxFileSize} byte size limit.`);

        return;
      });

      stream.on('error', (_error: Error) => {
        stream.unpipe();
      });

      stream.on('data', (chunk: Buffer) => temp.write(chunk));
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

    // FINISH PARSER
    parser.once('finish', () => {
      if (finished) {
        return;
      }

      request.unpipe(parser);
      request.resume();

      if (operations === null) {
        safeReject('Missing multipart field «operations»');

        return;
      }

      if (!map.size) {
        safeReject('Missing multipart field «map»');

        return;
      }

      safeResolve(operations);
    });

    parser.on('error', err => {
      request.unpipe(parser);
      request.resume();
      safeReject(err);
    });

    request.pipe(parser);
  });

export default multipartParser;

const CRLF = Buffer.from('\r\n');
