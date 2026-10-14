import type { ReadStream } from 'node:fs';
import type http from 'node:http';
import type { ReadableOptions } from 'node:stream';

import type { Configuration } from '../application/types';
import type { RequestBody } from '../http/types';

export interface ReadStreamOptions {
  highWaterMark?: ReadableOptions['highWaterMark'];
  encoding?: ReadableOptions['encoding'];
}

export interface FilePayload {
  /**
   * Name of the uploaded file
   */
  readonly filename: string;

  /**
   * Mime type of the uploaded file
   */
  readonly mimeType: string;

  /**
   * Encoding of the uploaded file
   */
  readonly encoding: string;

  /**
   * The size of file
   */
  readonly fileSize: number;

  /**
   * Function to read uploaded file\
   * Example:
   *
   * ```ts
   * import path from 'node:path';
   * import fs from 'node:fs';
   * import {
   *   GraphQLNonNull,
   *   GraphQLList,
   *   GraphQLObjectType,
   *   GraphQLString,
   *   GraphQLInt,
   * } from 'graphql';
   * import {
   *   UploadedFile,
   *   FileUploadScalarType,
   * } from '@via-profit-services/core';
   *
   * const Mutation = new GraphQLObjectType({
   *   name: 'Mutation',
   *   fields: {
   *     uploadFiles: {
   *       description: 'Upload files and get their location, mimeType and size',
   *       type: new GraphQLNonNull(
   *         new GraphQLList(
   *           new GraphQLNonNull(
   *             new GraphQLObjectType({
   *               name: 'UploadedFilePayload',
   *               fields: {
   *                 location: { type: new GraphQLNonNull(GraphQLString) },
   *                 mimeType: { type: new GraphQLNonNull(GraphQLString) },
   *                 size: { type: new GraphQLNonNull(GraphQLInt) },
   *               },
   *             }),
   *           ),
   *         ),
   *       ),
   *       args: {
   *         files: {
   *           type: new GraphQLNonNull(
   *             new GraphQLList(
   *               new GraphQLNonNull(
   *                 // This is where the FileUploadScalarType scalar is used
   *                 FileUploadScalarType,
   *               ),
   *             ),
   *           ),
   *         },
   *       },
   *       resolve: async (_parent, args: { files: UploadedFile[] }) => {
   *         const { files } = args;
   *
   *         // Just response data array
   *         const response: {
   *           location: string;
   *           mimeType: string;
   *         }[] = [];
   *
   *         // Don't forget call this promise
   *         // Uploading files is an asynchronous operation
   *         const filesData = await Promise.all(files);
   *
   *         // Now you can read the files
   *         await filesData.reduce(async (prev, file) => {
   *           await prev;
   *
   *           const readStream = file.createReadStream();
   *           const fileExt = file.mimeType.replace(/\//, '');
   *           const filename = `${Date.now()}.${fileExt}`;
   *           const location = path.resolve(__dirname, `./files/${filename}`);
   *
   *           fs.mkdirSync(path.dirname(location), { recursive: true });
   *           const writeStream = fs.createWriteStream(location);
   *
   *           const writeFile = new Promise<void>(resolve => {
   *             writeStream.on('close', async () => {
   *               response.push({
   *                 location,
   *                 mimeType: file.mimeType,
   *               });
   *               resolve();
   *             });
   *
   *             readStream.pipe(writeStream);
   *           });
   *
   *           await writeFile;
   *         }, Promise.resolve());
   *
   *         return response;
   *       },
   *     },
   *   },
   * });
   * ```
   */
  readonly createReadStream: (options?: ReadStreamOptions) => ReadStream;

  /**
   * Removes the temporary file right now.\
   * Optional: the core removes temporary files automatically when the
   * HTTP response is closed. Read or copy the file before that moment.
   */
  readonly cleanup: () => void;
}

export type UploadedFile = Promise<FilePayload>;

export type MultipartParser = (props: {
  request: http.IncomingMessage;
  response: http.ServerResponse;
  config: Configuration;
}) => Promise<RequestBody>;
