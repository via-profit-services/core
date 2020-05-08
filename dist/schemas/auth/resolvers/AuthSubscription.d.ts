import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../types';
export declare enum SubscriptioTriggers {
    TOKEN_REVOKED = "token-revoked"
}
declare const authSubscription: IResolverObject<any, IContext>;
export default authSubscription;
