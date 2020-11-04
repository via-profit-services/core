import { IContext } from '../types';
interface IAuthMiddlewareConfig {
    context: IContext;
    endpoint: string;
}
declare const _default: (config: IAuthMiddlewareConfig) => import("express-serve-static-core").Router;
export default _default;
