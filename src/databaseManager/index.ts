import { Options, Sequelize } from 'sequelize';

const sequelizeProvider = (options: Options) => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    ...options,
  });

  return sequelize;
};

export { sequelizeProvider };
export default sequelizeProvider;
// TODO Tests reuired
