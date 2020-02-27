import { IContext } from "../app";
declare const configureTokens: (roles: string[], context: IContext) => import("../authentificator/authentificator").ITokenPackage;
export default configureTokens;
export { configureTokens };
