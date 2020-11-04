import { NextFunction, Request, Response } from 'express';
import { IContext } from '../../types';
declare const _default: (config: ILoggerMiddlewareConfig) => (req: Request, res: Response, next: NextFunction) => void;
export default _default;
interface ILoggerMiddlewareConfig {
    context: IContext;
}
