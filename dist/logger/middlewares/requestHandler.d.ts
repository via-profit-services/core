import { NextFunction, Request, Response } from 'express';
import { IContext } from "../../app";
declare const _default: (config: ILoggerMiddlewareConfig) => (req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response, next: NextFunction) => void;
export default _default;
interface ILoggerMiddlewareConfig {
    context: IContext;
}
