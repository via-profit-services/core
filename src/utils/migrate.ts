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
}

interface IArgs {
  to?: IMigrateTo;
  make?: string;
}

/**
 * UP DOWN and LATEST
 */
switch (args.to) {
  case IMigrateTo.up:
    MigrationManager.up().then(() => {
      console.log(chalk.green('UP migration success'));
      process.exit(0);
    });
    break;
  case IMigrateTo.down:
    MigrationManager.down().then(() => {
      console.log(chalk.green('DOWN migration success'));
      process.exit(0);
    });
    break;
  case IMigrateTo.latest:
    MigrationManager.latest().then(() => {
      console.log(chalk.green('LATEST migration success'));
      process.exit(0);
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

  MigrationManager.make(args.make).then(a => {
    console.log(chalk.green('MAKE migration success'));
    console.log(a);
    process.exit(0);
  });
}
