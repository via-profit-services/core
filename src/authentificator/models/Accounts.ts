import { Sequelize, DataTypes, Model } from 'sequelize';

class AccountsModel extends Model {
  public id: string;

  public name: string;

  public login: string;

  public password: string;

  public status: 'allowed' | 'forbidden';
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
    },
    {
      sequelize,
      modelName: 'accounts',
    },
  );

  return AccountsModel;
};

export default modelFactory;
