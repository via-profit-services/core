import { IResolverObject } from 'graphql-tools';
import { IContext } from "../../../app";
import { OrderRange, AccountStatus } from "../../../authentificator";
export declare const AccountsQueries: IResolverObject<any, IContext, IListArgs>;
interface IListArgs {
    first?: number;
    last?: number;
    after?: string;
    before?: string;
    status?: AccountStatus;
    orderBy?: {
        field: string;
        direction: OrderRange;
    };
}
export default AccountsQueries;
