import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { AccountStatus } from '../../../authentificator';
import { IDirectionRange } from '../../../utils/generateCursorBundle';
export declare const AccountsQuery: IResolverObject<any, IContext, IListArgs>;
interface IListArgs {
    first?: number;
    last?: number;
    after?: string;
    before?: string;
    status?: AccountStatus;
    orderBy?: {
        field: string;
        direction: IDirectionRange;
    };
}
export default AccountsQuery;
