import { MigratorConfig } from 'knex';
import ServerError from '../logger/errorHandlers/ServerError';
import { knexProvider, IConfig } from './databaseManager';

const migrationManager = (config: IConfig) => {
  const { logger } = config;
  const knex = knexProvider(config);

  return {
    up: async (migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.up(migratorConfig);
        logger.sql.debug('The UP migration was successful');
      } catch (err) {
        throw new ServerError('The UP migration was failed', err);
      }
    },
    down: async (migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.down(migratorConfig);
        logger.sql.debug('The DOWN migration was successful');
      } catch (err) {
        throw new ServerError('The DOWN migration was failed', err);
      }
    },
    latest: async (migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.latest(migratorConfig);
        logger.sql.debug('The LATEST migration was successful');
      } catch (err) {
        throw new ServerError('The LATEST migration was failed', err);
      }
    },
    rollback: async (migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.rollback(migratorConfig);
        logger.sql.debug('The ROLLBACK migration was successful');
      } catch (err) {
        throw new ServerError('The ROLLBACK migration was failed', err);
      }
    },
    list: async (migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.list(migratorConfig);
        logger.sql.debug('The UP migration was successful');
      } catch (err) {
        throw new ServerError('The UP migration was failed', err);
      }
    },
    make: async (name: string, migratorConfig?: MigratorConfig) => {
      try {
        await knex.migrate.make(name, migratorConfig);
        logger.sql.debug('The MAKE migration was successful');
      } catch (err) {
        throw new ServerError('The MAKE migration was failed', err);
      }
    },
  };
};

export default migrationManager;
export { migrationManager };
