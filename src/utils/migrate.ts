/* eslint-disable import/no-extraneous-dependencies */
import chalk from 'chalk';
import minimist from 'minimist';
import { migrationManager } from '../databaseManager';
import { configureApp } from './configureApp';

const { database, logger } = configureApp();
const args = minimist<IArgs>(process.argv);
const MigrationManager = migrationManager({ database, logger });

enum IMigrateTo {
  up = 'up',
  down = 'down',
  latest = 'latest',
  current = 'current',
}

interface IArgs {
  to?: IMigrateTo;
  make?: string;
  status?: boolean;
  list?: boolean;
}

/**
 * UP DOWN LATEST and CURRENT
 */
switch (args.to) {
  case IMigrateTo.up:
    MigrationManager.up()
      .then(() => {
        console.log(chalk.green('UP migration success'));
        process.exit(0);
      })
      .catch(err => {
        console.log(chalk.red('UP migration failed'), err);
        process.exit(1);
      });
    break;
  case IMigrateTo.down:
    MigrationManager.down()
      .then(() => {
        console.log(chalk.green('DOWN migration success'));
        process.exit(0);
      })
      .catch(err => {
        console.log(chalk.red('DOWN migration failed'), err);
        process.exit(1);
      });
    break;
  case IMigrateTo.latest:
    MigrationManager.latest()
      .then(() => {
        console.log(chalk.green('LATEST migration success'));
        process.exit(0);
      })
      .catch(err => {
        console.log(chalk.red('LATEST migration failed'), err);
        process.exit(1);
      });
    break;
  case IMigrateTo.current:
    MigrationManager.currentVersion()
      .then(() => {
        console.log(chalk.green('CURRENT VERSION migration success'));
        process.exit(0);
      })
      .catch(err => {
        console.log(chalk.red('CURRENT VERSION migration failed'), err);
        process.exit(1);
      });
    break;

  default:
    break;
}

/**
 * Make
 */
if (args.make !== undefined) {
  if (typeof args.make !== 'string') {
    console.log(chalk.red('Argument «make» must be a string'));
    process.exit(1);
  }

  MigrationManager.make(args.make)
    .then(() => {
      console.log(chalk.green('MAKE migration success'));
      process.exit(0);
    })
    .catch(err => {
      console.log(chalk.red('MAKE migration failed'), err);
      process.exit(1);
    });
}

/**
 * Status
 */
if (typeof args.status === 'boolean') {
  MigrationManager.status()
    .then(status => {
      console.log(status);
      process.exit(0);
    })
    .catch(err => {
      console.log(chalk.red('get migration status failed'), err);
      process.exit(1);
    });
}

/**
 * List
 */
if (typeof args.list === 'boolean') {
  MigrationManager.status()
    .then(list => {
      console.log(list);
      process.exit(0);
    })
    .catch(err => {
      console.log(chalk.red('get migration list failed'), err);
      process.exit(1);
    });
}
