import { IContext } from '../../types';
import { TOutputFilter, IListResponse } from '../../utils';
export declare enum AccountStatus {
    allowed = "allowed",
    forbidden = "forbidden"
}
declare class Accounts {
    props: IProps;
    constructor(props: IProps);
    getAccounts(filter: Partial<TOutputFilter>): Promise<IListResponse<IAccount>>;
    getAccountsByIds(ids: string[]): Promise<IAccount[]>;
    getAccount(id: string): Promise<IAccount | false>;
    getAccountByLogin(login: string): Promise<IAccount | false>;
    updateAccount(id: string, accountData: Partial<IAccountUpdateInfo>): Promise<void>;
    createAccount(accountData: Partial<IAccountCreateInfo>): Promise<string>;
    deleteAccount(id: string): Promise<void>;
}
export default Accounts;
interface IProps {
    context: IContext;
}
export declare type IAccountRole = string;
export interface IAccount {
    id: string;
    name: string;
    login: string;
    password: string;
    status: AccountStatus;
    roles: IAccountRole[];
    createdAt: Date;
    updatedAt: Date;
    deleted: Boolean;
    cursor: string;
}
export declare type IAccountUpdateInfo = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt' | 'cursor'>;
export declare type IAccountCreateInfo = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt' | 'cursor'> & {
    id?: string;
};
