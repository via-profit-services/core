/// <reference types="node" />
import { ReadStream } from 'fs';
import { Request, Response } from 'express';
export declare type TProcessRequest = (request: Request, response: Response, options: Partial<TProcessRequestOptions>) => Promise<any>;
export interface TProcessRequestOptions {
    maxFieldSize: number;
    maxFileSize: number;
    maxFiles: number;
}
export interface IFilePayload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: (name?: string) => ReadStream;
}
export declare type IFile = Promise<IFilePayload>;
