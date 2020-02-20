import { ErrorHandler } from './index';
export default class BadRequestError extends Error implements ErrorHandler {
    metaData: {};
    status: number;
    constructor(message: string, metaData?: {});
}
