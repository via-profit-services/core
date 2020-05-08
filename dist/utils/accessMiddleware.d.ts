import { NextFunction, Request, Response } from 'express';
import { IContext } from '../types';
export declare const accessMiddleware: (props: IProps) => (req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response, next: NextFunction) => Promise<void>;
interface IProps {
    context: IContext;
}
export default accessMiddleware;
