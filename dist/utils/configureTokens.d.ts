import { IContext } from '../types';
declare const configureTokens: (roles: string[], context: IContext) => import("../schemas/auth/service").ITokenPackage;
export default configureTokens;
export { configureTokens };
