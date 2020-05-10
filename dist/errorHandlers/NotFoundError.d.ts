import { ErrorHandler } from './index';
export default class NotFoundError extends Error implements ErrorHandler {
    metaData: {};
    status: number;
    constructor(message: string, metaData?: {});
}
