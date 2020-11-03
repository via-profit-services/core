import { ErrorHandler } from './index';
export default class BadRequestError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
}
