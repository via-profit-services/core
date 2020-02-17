import { Sequelize, Model } from 'sequelize';
import { IAccount } from '../Authentificator';
declare class AccountsModel extends Model {
    id: string;
    name: string;
    login: string;
    password: string;
    status: IAccount['status'];
    roles: IAccount['roles'];
}
declare const modelFactory: (sequelize: Sequelize) => typeof AccountsModel;
export default modelFactory;
