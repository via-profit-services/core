import { Request, Response, NextFunction } from 'express';
import { IContext } from '../types';
interface IProps {
    context: IContext;
}
declare const accessMiddleware: (props: IProps) => (error: any, req: Request, res: Response, next: NextFunction) => void;
export default accessMiddleware;
