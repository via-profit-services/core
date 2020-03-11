import { MigratorConfig } from 'knex';
import { IConfig } from './databaseManager';
declare const migrationManager: (config: IConfig) => {
    status: (migratorConfig?: MigratorConfig) => Promise<number>;
    currentVersion: (migratorConfig?: MigratorConfig) => Promise<string>;
    up: (migratorConfig?: MigratorConfig) => Promise<any>;
    down: (migratorConfig?: MigratorConfig) => Promise<any>;
    latest: (migratorConfig?: MigratorConfig) => Promise<any>;
    rollback: (migratorConfig?: MigratorConfig) => Promise<any>;
    list: (migratorConfig?: MigratorConfig) => Promise<any>;
    make: (name: string, migratorConfig?: MigratorConfig) => Promise<string>;
};
export default migrationManager;
export { migrationManager };
