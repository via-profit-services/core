import { IContext, IObjectTypeResolver } from '../../../types';
export declare enum SubscriptioTriggers {
    TOKEN_REVOKED = "token-revoked"
}
declare const authSubscription: IObjectTypeResolver<any, IContext>;
export default authSubscription;
