import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';
import ServerError from './ServerError';
export { ServerError, BadRequestError, ForbiddenError, NotFoundError };
export interface ErrorHandler extends Error {
    message: string;
    status?: number;
    stack?: string;
    metaData?: {};
}
