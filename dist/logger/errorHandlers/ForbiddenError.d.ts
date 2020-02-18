import { ErrorHandler } from './index';
export default class ForbiddenError extends Error implements ErrorHandler {
    metaData: {};
    status: number;
    constructor(message: string, metaData?: {});
}
