import { IContext } from '../app';
declare const configureTokens: (roles: string[], context: IContext) => import("../schemas/auth/service").ITokenPackage;
export default configureTokens;
export { configureTokens };
