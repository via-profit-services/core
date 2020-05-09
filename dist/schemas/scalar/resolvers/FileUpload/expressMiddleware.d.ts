import { Request, NextFunction } from 'express';
import { IContext } from '../../../../types';
import { TProcessRequest } from './types';
declare const graphqlUploadExpress: (context: IContext, props: Partial<TProcessRequest>) => (request: Request<import("express-serve-static-core").ParamsDictionary>, response: any, next: NextFunction) => void | Promise<void> | {
    message: string;
    locations: readonly import("graphql").SourceLocation[];
    stack: string[];
    path: readonly (string | number)[];
} | {
    message: string;
    locations: readonly import("graphql").SourceLocation[];
    path: readonly (string | number)[];
    stack?: undefined;
};
export default graphqlUploadExpress;
