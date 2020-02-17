import { Sequelize, DataTypes, Model, NOW } from 'sequelize';
import { IAccount } from '../Authentificator';

class AccountsModel extends Model {
  public id: string;

  public name: string;

  public login: string;

  public password: string;

  public status: IAccount['status'];

  public roles: IAccount['roles'];
}

const modelFactory = (sequelize: Sequelize) => {
  AccountsModel.init(
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('allowed', 'forbidden'),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: NOW,
      },
    },
    {
      sequelize,
      modelName: 'accounts',
    },
  );

  return AccountsModel;
};

export default modelFactory;
