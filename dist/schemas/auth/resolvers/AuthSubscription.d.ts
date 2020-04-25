import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
export declare enum SubscriptioTriggers {
    TOKEN_REVOKED = "token-revoked"
}
declare const authSubscription: IResolverObject<any, IContext>;
export default authSubscription;
