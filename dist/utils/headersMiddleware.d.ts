import { NextFunction, Request, Response } from 'express';
export declare const headersMiddleware: () => (req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response, next: NextFunction) => void;
export default headersMiddleware;
