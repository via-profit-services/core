import ServerError from './ServerError';
import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';

export { ServerError, BadRequestError, ForbiddenError, NotFoundError };

export interface ErrorHandler extends Error {
  message: string;
  status?: number;
  stack?: string;
  metaData?: {};
}
