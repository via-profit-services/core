import type { Readable } from 'node:stream';

import FileUploadInstance from './file-upload-instance';
import { TempFile } from './temp-file';
import {
  Multipart,
  MultipartError,
  DEFAULT_MAX_PART_HEADER_SIZE,
  isValidBoundary,
  type MultipartFileInfo,
} from './multipart';
import { setUploadByPath } from './map-path';
import parseContentType from '../http/content-type-parser';
import { setBodyStats } from '../http/body-stats';
import { isPlainObject } from '../utils/is-plain-object';
import {
  DEFAULT_MAX_FIELD_SIZE,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILE_TOTAL_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_FIELDS,
  DEFAULT_MAX_FILE_PARTS,
} from '../constants';
import type { RequestBody } from '../http/types';
import type { MultipartParser } from './types';

/**
 * Body property holding the function that removes temporary files of the
 * request. Used by the HTTP listener when there is no real
 * http.ServerResponse to wait for (see `scheduleCleanup`).
 */
export const UPLOAD_CLEANUP = Symbol('@via-profit-services/core/upload-cleanup');

/**
 * GraphQL multipart request (https://github.com/jaydenseric/graphql-multipart-request-spec).
 *
 * Expected order of parts:
 *   1. `operations` - JSON: { query, variables, operationName } with `null` instead of files
 *   2. `map`        - JSON: { "0": ["variables.file"], "1": ["variables.list.0"] }
 *   3. files        - the part name is the key from `map`
 *
 * Lifecycle:
 *   - every file is streamed into its own temporary file as it arrives;
 *   - the promise resolves when the whole body was parsed AND all files are
 *     on disk. At that point every upload in `variables` is already resolved;
 *   - if `map` references a file that did not arrive, the request fails
 *     (otherwise a resolver awaiting this file would wait forever);
 *   - on any error reading stops, all temporary files are removed and all
 *     uploads are rejected;
 *   - after success, temporary files are removed when the HTTP response is
 *     closed. A resolver must read (or copy) a file before that.
 */
const graphqlFileUploader: MultipartParser = ({ request, response, config }) =>
  new Promise<RequestBody>((resolve, reject) => {
    const { limits = {} } = config;
    const maxFiles = limits.maxFiles ?? DEFAULT_MAX_FILES;
    const contentType = parseContentType(String(request.headers['content-type'] || ''));

    if (!contentType || contentType.type !== 'multipart/form-data') {
      reject(new MultipartError('Invalid content-type for multipart request', 415));

      return;
    }

    const { boundary } = contentType.params;
    if (!isValidBoundary(boundary)) {
      reject(
        new MultipartError(
          'Invalid multipart boundary: it must be 1-70 characters long and contain only allowed characters (RFC 2046)',
        ),
      );

      return;
    }

    const parser = new Multipart(boundary, {
      fieldSize: limits.maxFieldSize ?? DEFAULT_MAX_FIELD_SIZE,
      fileSize: limits.maxFileSize ?? DEFAULT_MAX_FILE_SIZE,
      filesTotalSize: limits.maxFilesTotalSize ?? DEFAULT_MAX_FILE_TOTAL_SIZE,
      files: maxFiles,
      fields: limits.maxFileFields ?? DEFAULT_MAX_FILE_FIELDS,
      parts: limits.maxFileParts ?? DEFAULT_MAX_FILE_PARTS,
      headerSize: DEFAULT_MAX_PART_HEADER_SIZE,
    });

    let operations: RequestBody | null = null;
    let mapReceived = false;
    let settled = false;
    const uploads = new Map<string, FileUploadInstance>();
    const receivedFiles = new Set<string>();
    const tempFiles = new Set<TempFile>();
    const writes: Promise<void>[] = [];

    const cleanupAll = () => {
      for (const temp of tempFiles) {
        temp.cleanup();
      }
      tempFiles.clear();
    };

    const fail = (err: unknown) => {
      if (settled) {
        return;
      }
      settled = true;

      const error = err instanceof Error ? err : new Error(String(err));
      // Stop reading. The rest of the body is NOT drained on purpose:
      // draining would make the server download everything a client sends
      // (e.g. 10 GB when the limit is 1 KB). The HTTP server decides what to
      // do with the unread body after the response is sent.
      request.unpipe(parser);
      parser.destroy();

      uploads.forEach(upload => upload.reject(error));
      cleanupAll();
      reject(error);
    };

    const succeed = async () => {
      try {
        // wait until every file is completely written to disk
        await Promise.all(writes);
      } catch (err) {
        fail(err);

        return;
      }

      if (settled) {
        return;
      }

      if (!operations) {
        fail(new MultipartError('Missing multipart field «operations»'));

        return;
      }

      for (const [name, upload] of uploads) {
        if (!receivedFiles.has(name)) {
          fail(
            new MultipartError(
              `File «${name}» is referenced in the «map» multipart field, but was not received`,
            ),
          );

          return;
        }

        if (!upload.finished) {
          fail(new MultipartError(`File «${name}» was not completely received`));

          return;
        }
      }

      settled = true;
      setBodyStats(operations, {
        files: parser.filesReceived,
        filesTotalSize: parser.filesReceivedSize,
      });
      scheduleCleanup(operations, response, cleanupAll);
      resolve(operations);
    };

    const onOperations = (value: string) => {
      if (operations) {
        throw new MultipartError('Multiple «operations» multipart fields are not allowed');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (err) {
        throw new MultipartError(
          `Invalid JSON in the «operations» multipart field. ${err instanceof Error ? err.message : ''}`,
        );
      }

      if (Array.isArray(parsed)) {
        throw new MultipartError('Batched operations are not supported');
      }

      if (!isPlainObject(parsed)) {
        throw new MultipartError('The «operations» multipart field must be a JSON object');
      }

      const { variables } = parsed;
      if (typeof variables !== 'undefined' && variables !== null && !isPlainObject(variables)) {
        throw new MultipartError('«operations.variables» must be an object');
      }

      // Keep other keys too: the persisted query key is read later
      operations = { ...parsed, variables: variables ?? {} } as RequestBody;
    };

    const onMap = (value: string) => {
      if (!operations) {
        throw new MultipartError(
          'The «map» multipart field must come after the «operations» field',
        );
      }

      if (mapReceived) {
        throw new MultipartError('Multiple «map» multipart fields are not allowed');
      }
      mapReceived = true;

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (err) {
        throw new MultipartError(
          `Invalid JSON in the «map» multipart field. ${err instanceof Error ? err.message : ''}`,
        );
      }

      if (!isPlainObject(parsed)) {
        throw new MultipartError('The «map» multipart field must be a JSON object');
      }

      const entries = Object.entries(parsed);
      if (entries.length > maxFiles) {
        throw new MultipartError(`Multipart request exceeds the limit of ${maxFiles} files`, 413);
      }

      for (const [fileName, paths] of entries) {
        if (!Array.isArray(paths) || paths.length === 0) {
          throw new MultipartError(
            `The «map» multipart field entry «${fileName}» must be a non-empty array of paths`,
          );
        }

        const upload = new FileUploadInstance();
        uploads.set(fileName, upload);

        for (const path of paths) {
          if (typeof path !== 'string') {
            throw new MultipartError(
              `The «map» multipart field entry «${fileName}» must contain only strings`,
            );
          }

          const error = setUploadByPath(operations as Record<string, unknown>, path, upload);
          if (error) {
            throw new MultipartError(error);
          }
        }
      }
    };

    parser.on('field', (name: string, value: string) => {
      // An exception thrown here is caught by the parser and becomes its 'error'
      if (name === 'operations') {
        onOperations(value);
      } else if (name === 'map') {
        onMap(value);
      }
      // Other fields are ignored (they are still counted by the parts/fields limits)
    });

    parser.on('file', (name: string, stream: Readable, info: MultipartFileInfo) => {
      if (!mapReceived) {
        throw new MultipartError('File parts must come after the «map» multipart field');
      }

      const upload = uploads.get(name);
      if (!upload) {
        throw new MultipartError(`File «${name}» is not referenced in the «map» multipart field`);
      }

      if (receivedFiles.has(name)) {
        throw new MultipartError(`File «${name}» was sent more than once`);
      }
      receivedFiles.add(name);

      const temp = new TempFile();
      tempFiles.add(temp);

      const write = temp.writeFrom(stream).then(fileSize => {
        upload.resolve({
          filename: info.filename,
          mimeType: info.mimeType,
          encoding: info.encoding,
          fileSize,
          createReadStream: options => temp.createReadStream(options),
          cleanup: () => temp.cleanup(),
        });
      });

      // a write error (disk full, parser aborted...) fails the whole request
      write.catch(fail);
      writes.push(write);
    });

    parser.on('error', fail);
    parser.on('finish', () => {
      void succeed();
    });

    request.on('error', fail);
    request.on('close', () => {
      // 'close' without 'end' means the client aborted the request
      if (!settled && !request.readableEnded) {
        fail(new MultipartError('The request was aborted by the client'));
      }
    });

    request.pipe(parser);
  });

/**
 * Temporary files must live until resolvers have read them, i.e. until the
 * HTTP response is sent. With a real http.ServerResponse we wait for its
 * 'close' event (emitted in both cases: response sent or connection lost).
 * Otherwise the HTTP listener calls the cleanup itself after execution.
 */
const scheduleCleanup = (body: RequestBody, response: unknown, cleanup: () => void) => {
  const emitter = response as { once?: unknown; closed?: boolean } | undefined;

  if (emitter && typeof emitter.once === 'function') {
    if (emitter.closed) {
      cleanup();
    } else {
      (emitter.once as (event: string, cb: () => void) => void).call(emitter, 'close', cleanup);
    }

    return;
  }

  Object.defineProperty(body, UPLOAD_CLEANUP, { value: cleanup, enumerable: false });
};

export default graphqlFileUploader;
