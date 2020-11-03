import { ErrorHandler } from './index';
export default class ServerError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
}
