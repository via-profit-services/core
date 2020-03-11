import { MigratorConfig } from 'knex';
import ServerError from '../logger/errorHandlers/ServerError';
import { knexProvider, IConfig } from './databaseManager';

const migrationManager = (config: IConfig) => {
  const { logger } = config;
  const knex = knexProvider(config);

  return {
    status: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.status(migratorConfig);
        return result;
      } catch (err) {
        throw new ServerError('Unknown error with Knex migration status', err);
      }
    },
    currentVersion: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.currentVersion(migratorConfig);
        logger.sql.debug('The Knex CURRENTVERSION migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The UP migration was failed', err);
      }
    },
    up: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.up(migratorConfig);
        logger.sql.debug('The Knex UP migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex UP migration was failed', err);
      }
    },
    down: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.down(migratorConfig);
        logger.sql.debug('The Knex DOWN migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex DOWN migration was failed', err);
      }
    },
    latest: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.latest(migratorConfig);
        logger.sql.debug('The Knex LATEST migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex LATEST migration was failed', err);
      }
    },
    rollback: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.rollback(migratorConfig);
        logger.sql.debug('The Knex ROLLBACK migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex ROLLBACK migration was failed', err);
      }
    },
    list: async (migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.list(migratorConfig);
        logger.sql.debug('The Knex UP migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex UP migration was failed', err);
      }
    },
    make: async (name: string, migratorConfig?: MigratorConfig) => {
      try {
        const result = await knex.migrate.make(name, migratorConfig);
        logger.sql.debug('The Knex MAKE migration was successful');
        return result;
      } catch (err) {
        throw new ServerError('The Knex MAKE migration was failed', err);
      }
    },
  };
};

export default migrationManager;
export { migrationManager };
