import type { RequestBody, MultipartParser } from '@via-profit-services/core';

import FileUploadInstance from './FileUploadInstance';
import dotNotationSet from './set';
import { DEFAULT_MAX_FIELD_SIZE, DEFAULT_MAX_FILE_SIZE, DEFAULT_MAX_FILE_TOTAL_SIZE, DEFAULT_MAX_FILES, DEFAULT_PERSISTED_QUERY_KEY } from '../constants';
import { TempFile } from './TempFile';
import { Multipart, NormalizeLineEndings } from './Multipart';

/**
 * Validates that a dot-notation path exists inside an object.
 */
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
    const persistedQueriesMap = config.persistedQueriesMap || {};
    const persistedQueryKey = config.persistedQueryKey || DEFAULT_PERSISTED_QUERY_KEY;
    const limits = {
      maxFieldSize: DEFAULT_MAX_FIELD_SIZE,
      maxFileSize: DEFAULT_MAX_FILE_SIZE,
      maxFiles: DEFAULT_MAX_FILES,
      maxFilesTotalSize: DEFAULT_MAX_FILE_TOTAL_SIZE,
      ...config.limits,
    }
    const { maxFieldSize, maxFileSize, maxFiles, maxFilesTotalSize } = limits;
    const { headers } = request;

    let finished = false;

    const safeReject = (err: any) => {
      if (finished) return;
      finished = true;

      cleanupAllTempFiles();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const safeResolve = (value: any) => {
      if (finished) return;
      finished = true;

      cleanupAllTempFiles();
      resolve(value);
    };

    if (!headers?.['content-type']?.includes('multipart/form-data')) {
      safeReject(new Error('Invalid content-type for multipart'));
      return;
    }

    
    const parser = new Multipart({ headers, limits });

    // Track all TempFiles for cleanup
    const tempFiles = new Set<TempFile>();

    const cleanupAllTempFiles = () => {
      for (const file of tempFiles) {
        try {
          file.cleanup();
        } catch {
          // do nothing
        }
      }
      tempFiles.clear();
    };

    request.on('close', () => {
      parser.destroy(new Error('Request closed unexpectedly'));
    });

    request.on('aborted', () => {
      parser.emit('error', new Error('Request aborted by client'));
    });

    const map = new Map<number, FileUploadInstance>();
    const operations: RequestBody = {};

    let operationsReceived = false;
    let totalSize = 0;

    //
    // FIELD HANDLER
    //
    parser.on('field', (fieldName, value, { valueTruncated }) => {
      if (valueTruncated) {
        safeReject(
          new Error(
            `The «${fieldName}» multipart field value exceeds the ${maxFieldSize} byte size limit.`,
          ),
        );
        return;
      }

      //
      // OPERATIONS FIELD
      //
      if (fieldName === 'operations') {
        if (operationsReceived) {
          safeReject(new Error('Multiple "operations" fields are not allowed.'));
          return;
        }
        operationsReceived = true;

        let parsed: any = {};
        try {
          parsed = JSON.parse(value);
        } catch (err) {
          safeReject(
            new Error(
              `Invalid JSON in the «operations» multipart field. ${
                err instanceof Error ? err.message : 'Unknown Error'
              }`,
            ),
          );
          return;
        }

        if (typeof parsed !== 'object') {
          safeReject(
            new Error(`«operations» multipart field must be an object. Got ${typeof parsed}`),
          );
          return;
        }

        const { query, variables, operationName } = parsed;

        if (typeof variables === 'object') {
          operations.variables = variables;
        }

        if (typeof operationName === 'string') {
          operations.operationName = operationName;
        }

        if (typeof query === 'string') {
          operations.query = query;
        }

        // persisted query support
        if (
          typeof parsed[persistedQueryKey] === 'string' &&
          persistedQueriesMap[parsed[persistedQueryKey]]
        ) {
          operations.query = persistedQueriesMap[parsed[persistedQueryKey]];
        }

        if (typeof operations.query !== 'string') {
          safeReject(
            new Error(
              [
                `«operations.query» multipart field must be a string. Got ${typeof operations.query}.`,
                `If you use PersistedQuery, the request must contain a key like «${DEFAULT_PERSISTED_QUERY_KEY}» containing the ID of the stored query.`,
              ].join('\n'),
            ),
          );
          return;
        }

        if (typeof operations.variables !== 'object') {
          safeReject(
            new Error(
              `«operations.variables» multipart field must be an object. Got ${typeof operations.variables}`,
            ),
          );
          return;
        }
      }

      //
      // MAP FIELD
      //
      if (fieldName === 'map') {
        let mapData: Record<number, string[]>;
        try {
          mapData = JSON.parse(value);
        } catch (err) {
          safeReject(
            new Error(
              `Invalid JSON in the «map» field. ${
                err instanceof Error ? err.message : 'Unknown Error'
              }`,
            ),
          );
          return;
        }

        if (Object.entries(mapData).length > maxFiles) {
          safeReject(new Error(`${maxFiles} max file uploads exceeded.`));
          return;
        }

        for (const [fileIndex, paths] of Object.entries(mapData)) {
          if (!Array.isArray(paths)) {
            safeReject(
              new Error(
                `Invalid type for the «map» multipart field entry key «${fileIndex}» array.`,
              ),
            );
            return;
          }

          const upload = new FileUploadInstance();
          map.set(Number(fileIndex), upload);

          for (let i = 0; i < paths.length; i++) {
            const pathValue = paths[i];

            if (typeof pathValue !== 'string') {
              safeReject(
                new Error(
                  `Invalid type for the «map» multipart field entry key «${fileIndex}» array index «${i}» value`,
                ),
              );
              return;
            }

            if (!validateMapPath(operations, pathValue)) {
              safeReject(new Error(`Invalid map path: «${pathValue}»`));
              return;
            }

            dotNotationSet(operations, pathValue, upload);
          }
        }
      }
    });

    //
    // FILE HANDLER
    //
    parser.on('file', (fieldName, stream, { filename, mimeType, encoding }) => {
      const upload = map.get(Number(fieldName));

      if (!upload) {
        safeReject(new Error(`File from field «${fieldName}» is not registered in map field`));
        return;
      }

      const temp = new TempFile();
      tempFiles.add(temp);

      stream.on('error', () => {
        safeReject(new Error('File stream error'));
      });

      stream.on('limit', () => {
        safeReject(new Error(`File truncated as it exceeds the ${maxFileSize} byte size limit.`));
      });

      stream.on('data', (chunk: Buffer) => {
        totalSize += chunk.length;

        if (totalSize > maxFilesTotalSize) {
          safeReject(
            new Error(
              `Total upload size exceeds the ${maxFilesTotalSize} byte limit.`,
            ),
          );
          return;
        }

        temp.write(chunk);
      });

      stream.on('end', async () => {
        try {
          await temp.end();
          upload.resolve({
            filename,
            mimeType,
            encoding,
            createReadStream: () => temp.createReadStream(),
            cleanup: () => temp.cleanup(),
          });
        } catch (err) {
          safeReject(err);
        }
      });
    });

    //
    // PARSER FINISHED
    //
    parser.once('finish', () => {
      if (finished) {
        return;
      }

      request.unpipe(parser);
      request.resume();

      if (!operationsReceived) {
        safeReject(new Error('Missing multipart field «operations»'));
        return;
      }

      if (!map.size) {
        safeResolve(operations);
        // safeReject(new Error('Missing multipart field «map»'));
        return;
      }

      // Ensure all uploads are resolved or rejected
      for (const upload of map.values()) {
        if (!upload.file) {
          upload.reject(new Error('File was declared in map but not received'));
        }
      }

      safeResolve(operations);
    });

    parser.on('error', err => {
      request.unpipe(parser);
      request.resume();
      safeReject(err);
    });

    const normalizer = new NormalizeLineEndings();
    request.pipe(normalizer).pipe(parser);

  });

export default multipartParser;

const CRLF = Buffer.from('\r\n');
