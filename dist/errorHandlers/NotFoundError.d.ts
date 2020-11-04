import { ErrorHandler } from './index';
export default class NotFoundError extends Error implements ErrorHandler {
    metaData: any;
    status: number;
    constructor(message: string, metaData?: any);
}
