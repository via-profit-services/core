import { NextFunction, Request, Response } from 'express';
export declare const headersMiddleware: () => (req: Request, res: Response, next: NextFunction) => void;
export default headersMiddleware;
