import { MigratorConfig } from 'knex';
import { IConfig } from './databaseManager';
declare const migrationManager: (config: IConfig) => {
    up: (migratorConfig?: MigratorConfig) => Promise<void>;
    down: (migratorConfig?: MigratorConfig) => Promise<void>;
    latest: (migratorConfig?: MigratorConfig) => Promise<void>;
    rollback: (migratorConfig?: MigratorConfig) => Promise<void>;
    list: (migratorConfig?: MigratorConfig) => Promise<void>;
    make: (name: string, migratorConfig?: MigratorConfig) => Promise<void>;
};
export default migrationManager;
export { migrationManager };
