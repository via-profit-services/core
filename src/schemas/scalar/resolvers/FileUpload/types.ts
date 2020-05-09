import { ReadStream } from 'fs';
import { Request, Response } from 'express';


export type TProcessRequest = (
  request: Request,
  response: Response,
  options: Partial<TProcessRequestOptions>,
) => Promise<any>;

export interface TProcessRequestOptions {
  maxFieldSize: number;
  maxFileSize: number;
  maxFiles: number;
}

export interface IFilePayload {
  filename: string;
  mimeType: string;
  encoding: string;
  createReadStream: (name?: string) => ReadStream;
}

export type IFile = Promise<IFilePayload>;
