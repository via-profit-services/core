import { Request, Response, NextFunction } from 'express';
import { IContext } from '../../app';
import { ErrorHandler } from '../../errorHandlers';
declare const _default: (config: ILoggerMiddlewareConfig) => (((err: ErrorHandler, req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response, next: NextFunction) => void) | ((req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response) => void))[];
export default _default;
interface ILoggerMiddlewareConfig {
    context: IContext;
}
