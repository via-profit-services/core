import { IResolverObject } from 'graphql-tools';
export declare enum SubscriptioTriggers {
    ACCOUNT_UPDATED = "account-updated",
    ACCOUNT_DELETED = "account-deleted"
}
declare const accountsSubscription: IResolverObject;
export default accountsSubscription;
