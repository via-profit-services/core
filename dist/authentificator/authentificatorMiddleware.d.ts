import { IContext } from "../app";
declare const authentificatorMiddleware: (config: IMiddlewareConfig) => import("express-serve-static-core").Router;
export default authentificatorMiddleware;
export { authentificatorMiddleware };
interface IMiddlewareConfig {
    context: IContext;
    authUrl: string;
    allowedUrl: string[];
}
