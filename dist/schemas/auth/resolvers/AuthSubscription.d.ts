import { IObjectTypeResolver } from 'graphql-tools';
import { IContext } from '../../../types';
export declare enum SubscriptioTriggers {
    TOKEN_REVOKED = "token-revoked"
}
declare const authSubscription: IObjectTypeResolver<any, IContext>;
export default authSubscription;
