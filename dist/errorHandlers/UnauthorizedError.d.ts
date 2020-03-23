import { ErrorHandler } from './index';
export default class UnauthorizedError extends Error implements ErrorHandler {
    metaData: {};
    status: number;
    constructor(message: string, metaData?: {});
}
