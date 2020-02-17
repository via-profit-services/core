import { Sequelize, DataTypes, Model, NOW, JSON } from 'sequelize';

class TokensModel extends Model {
  public id!: string;

  public account!: string;

  public token!: string;

  public associated: string;

  public type: 'access' | 'refresh';

  public deviceInfo: JSON;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly expiredAt!: Date;
}

const modelFactory = (sequelize: Sequelize): typeof TokensModel => {
  TokensModel.init(
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      associated: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      account: {
        type: DataTypes.STRING,
        allowNull: true,
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
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('access', 'refresh'),
        allowNull: false,
      },
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'tokens',
    },
  );

  return TokensModel;
};

export default modelFactory;
