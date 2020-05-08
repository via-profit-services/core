import { Request, NextFunction } from 'express';
import { TProcessRequest } from './types';
declare const graphqlUploadExpress: (props: Partial<TProcessRequest>) => (request: Request<import("express-serve-static-core").ParamsDictionary>, response: any, next: NextFunction) => void | Promise<void>;
export default graphqlUploadExpress;
