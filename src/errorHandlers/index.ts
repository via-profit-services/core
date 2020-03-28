import BadRequestError from './BadRequestError';
import ForbiddenError from './ForbiddenError';
import NotFoundError from './NotFoundError';
import ServerError from './ServerError';
import UnauthorizedError from './UnauthorizedError';

export {
  ServerError, BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError,
};

export interface ErrorHandler extends Error {
  message: string;
  status?: number;
  stack?: string;
  metaData?: {};
}
