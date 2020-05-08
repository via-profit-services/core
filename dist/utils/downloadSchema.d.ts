/// <reference types="node" />
import { OutgoingHttpHeaders } from 'http';
export declare const downloadSchema: (options: IDownloadSchemaOptions) => Promise<void>;
export interface IDownloadSchemaOptions {
    endpoint: string;
    token: string;
    filename: string;
    method?: 'POST' | 'GET';
    headers?: OutgoingHttpHeaders;
}
