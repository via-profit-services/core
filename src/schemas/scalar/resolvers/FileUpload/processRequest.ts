import Busboy from 'busboy';
import { WriteStream } from 'fs-capacitor';
import objectPath from 'object-path';

import BadRequestError from '../../../../errorHandlers/BadRequestError';
import { TProcessRequestOptions, IFilePayload, TProcessRequest } from './types';
import UploadInstance from './UploadInstance';

const SPEC_URL = 'https://github.com/jaydenseric/graphql-multipart-request-spec';
const isObject = (val: any) => val != null && typeof val === 'object' && Array.isArray(val) === false;
const ignoreStream = (stream: any) => {
  stream.on('error', () => {});
  stream.resume();
};

export const defaultOptions: TProcessRequestOptions = {
  maxFieldSize: 1000000, // 1 MB
  maxFileSize: Infinity,
  maxFiles: Infinity,
};

type IOperation = any;

const processRequest: TProcessRequest = (request, response, options) => {
  const { maxFieldSize, maxFiles, maxFileSize } = {
    ...defaultOptions,
    ...options,
  };

  return new Promise((resolve, reject) => {
    let released: any;
    let exitError: any;
    let currentStream: NodeJS.ReadableStream | null;
    let operations: any;
    let operationsPath: any;
    let map: any;

    const parser = new Busboy({
      headers: request.headers,
      limits: {
        fieldSize: maxFieldSize,
        fields: 2, // Only operations and map.
        fileSize: maxFileSize,
        files: maxFiles,
      },
    });


    const exit = (error: string) => {
      reject(error);

      parser.end();

      if (currentStream) {
        currentStream.unpipe();
      }

      if (map) {
        // eslint-disable-next-line no-restricted-syntax
        for (const upload of map.values()) {
          if (!upload.file) {
            upload.reject(error);
          }
        }
      }

      request.unpipe(parser);

      // With a sufficiently large request body, subsequent events in the same
      // event frame cause the stream to pause after the parser is destroyed. To
      // ensure that the request resumes, the call to .resume() is scheduled for
      // later in the event loop.
      setImmediate(() => {
        request.resume();
      });

      throw new BadRequestError(error);
    };

    /**
     * Releases resources and cleans up Capacitor temporary files. Successive
     * calls have no effect.
     * @kind function
     * @name processRequest~release
     * @ignore
     */
    const release = () => {
      if (released) return;
      released = true;

      if (map) {
        // eslint-disable-next-line no-restricted-syntax
        for (const upload of map.values()) {
          if (upload.file) {
            upload.file.capacitor.release();
          }
        }
      }
    };

    /**
     * Handles when the request is closed before it properly ended.
     * @kind function
     * @name processRequest~abort
     * @ignore
     */
    const abort = () => {
      exit('Request disconnected during file upload stream parsing.');
    };

    parser.on(
      'field',
      (fieldName, value, fieldNameTruncated, valueTruncated) => {
        if (exitError) {
          return;
        }

        if (valueTruncated) {
          exit(
            `The ‘${fieldName}’ multipart field value exceeds the ${maxFieldSize} byte size limit.`,
          );
        }

        // eslint-disable-next-line default-case
        switch (fieldName) {
          case 'operations':
            try {
              operations = JSON.parse(value);
            } catch (error) {
              exit(
                `Invalid JSON in the ‘operations’ multipart field (${SPEC_URL}).`,
              );
            }

            if (!isObject(operations) && !Array.isArray(operations)) {
              exit(
                `Invalid type for the ‘operations’ multipart field (${SPEC_URL}).`,
              );
            }

            operationsPath = objectPath(operations);

            break;
          case 'map': {
            if (!operations) {
              exit(
                `Misordered multipart fields; ‘map’ should follow ‘operations’ (${SPEC_URL}).`,
              );
            }

            let parsedMap: Map<string, IOperation>;
            try {
              parsedMap = JSON.parse(value);
            } catch (error) {
              exit(
                `Invalid JSON in the ‘map’ multipart field (${SPEC_URL}).`,
              );
            }

            if (!isObject(parsedMap)) {
              exit(
                `Invalid type for the ‘map’ multipart field (${SPEC_URL}).`,
              );
            }

            const mapEntries = Object.entries(parsedMap);

            // Check max files is not exceeded, even though the number of files to
            // parse might not match th(e map provided by the client.
            if (mapEntries.length > maxFiles) {
              exit(
                `${maxFiles} max file uploads exceeded.`,
              );
            }

            map = new Map();
            // eslint-disable-next-line no-restricted-syntax
            for (const [fldName, paths] of mapEntries) {
              if (!Array.isArray(paths)) {
                exit(
                  `Invalid type for the ‘map’ multipart field entry key ‘${fldName}’ array (${SPEC_URL}).`,
                );
              }

              map.set(fldName, new UploadInstance());

              // eslint-disable-next-line no-restricted-syntax
              for (const [index, path] of paths.entries()) {
                if (typeof path !== 'string') {
                  exit(
                    `Invalid type for the ‘map’ multipart field entry key ‘${fldName}’ array index ‘${index}’ value (${SPEC_URL}).`,
                  );
                }

                try {
                  operationsPath.set(path, map.get(fldName));
                } catch (error) {
                  exit(
                    `Invalid object path for the ‘map’ multipart field entry key ‘${fieldName}’ array index ‘${index}’ value ‘${path}’ (${SPEC_URL}).`,
                  );
                }
              }
            }

            resolve(operations);
          }
        }
      },
    );

    parser.on('file', (fieldName, stream, filename, encoding, mimeType) => {
      if (exitError) {
        ignoreStream(stream);
        return;
      }

      if (!map) {
        ignoreStream(stream);
        exit(
          `Misordered multipart fields; files should follow ‘map’ (${SPEC_URL}).`,
        );
      }

      currentStream = stream;
      stream.on('end', () => {
        currentStream = null;
      });

      const upload = map.get(fieldName);

      if (!upload) {
        // The file is extraneous. As the rest can still be processed, just
        // ignore it and don’t exit with an error.
        ignoreStream(stream);
        return;
      }

      let fileError: Error;
      const capacitor = new WriteStream();

      capacitor.on('error', () => {
        stream.unpipe();
        stream.resume();
      });

      stream.on('limit', () => {
        fileError = new BadRequestError(`File truncated as it exceeds the ${maxFileSize} byte size limit.`);
        stream.unpipe();
        capacitor.destroy(fileError);
      });

      stream.on('error', (error) => {
        fileError = error;
        stream.unpipe();
        capacitor.destroy(exitError);
      });

      const file: IFilePayload = {
        filename,
        mimeType,
        encoding,
        createReadStream(name?: string) {
          const error = fileError || (released ? exitError : null);
          if (error) throw error;
          return capacitor.createReadStream(name);
        },
      };

      Object.defineProperty(file, 'capacitor', { value: capacitor });

      stream.pipe(capacitor);
      upload.resolve(file);
    });

    parser.once('filesLimit', () => exit(`${maxFiles} max file uploads exceeded.`));

    parser.once('finish', () => {
      request.unpipe(parser);
      request.resume();

      if (!operations) {
        exit(
          `Missing multipart field ‘operations’ (${SPEC_URL}).`,
        );
      }

      if (!map) {
        exit(
          `Missing multipart field ‘map’ (${SPEC_URL}).`,
        );
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const upload of map.values()) {
        if (!upload.file) {
          upload.reject(new BadRequestError('File missing in the request.'));
        }
      }
    });

    parser.once('error', exit);

    response.once('finish', release);
    response.once('close', release);

    request.once('close', abort);
    request.once('end', () => {
      request.removeListener('close', abort);
    });

    request.pipe(parser);
  });
};

export default processRequest;
