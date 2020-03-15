#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import glob from 'glob';
import yargs, { Arguments } from 'yargs';

const getMigrations = (params: { migrations: boolean; seeds: boolean }) => {
  const dotenvFile = path.resolve(process.cwd(), '.env');
  const MIGRATIONS_DIR_PATTERN = 'migrations';
  const SEEDS_DIT_PATTERN = 'seeds';
  const searchPathPattern = `${process.cwd()}/node_modules/@via-profit-services/*/dist/database/@(${MIGRATIONS_DIR_PATTERN}|${SEEDS_DIT_PATTERN})/*.ts`;

  if (fs.existsSync(dotenvFile)) {
    const dotEnvData = dotenv.config({ path: dotenvFile }).parsed;

    if (dotEnvData.DB_MIGRATIONS_DIRECTORY !== undefined || dotEnvData.DB_SEEDS_DIRECTORY !== undefined) {
      glob(searchPathPattern, (err, files) => {
        files.forEach(filename => {
          if (!filename.match(/\.d\.ts$/)) {
            const dir = path.basename(path.dirname(filename));
            const migrationsDestPath = path.resolve(process.cwd(), dotEnvData.DB_MIGRATIONS_DIRECTORY);
            const seedsDestPath = path.resolve(process.cwd(), dotEnvData.DB_SEEDS_DIRECTORY);

            // copy migrations
            if (params.migrations && dir === MIGRATIONS_DIR_PATTERN && fs.existsSync(migrationsDestPath)) {
              fs.copyFileSync(filename, migrationsDestPath);
              console.log(`${chalk.yellow('Copy migration file')} from ${chalk.cyan(filename)}`);
            }

            // copy seeds
            if (params.seeds && dir === SEEDS_DIT_PATTERN && fs.existsSync(seedsDestPath)) {
              fs.copyFileSync(filename, seedsDestPath);
              console.log(`${chalk.yellow('Copy seed file')} from ${chalk.cyan(filename)}`);
            }
          }
        });
      });
    }
  }
};

const args = yargs
  .command<
    Arguments<{
      migrations: boolean;
      seeds: boolean;
    }>
  >(
    'get-migrations',
    'Copy all migration and/or seed files from @via-profit-services modules into your project',
    () => {},
    action => {
      const { migrations, seeds } = action;
      getMigrations({ migrations, seeds });
    },
  )
  .options({
    migrations: {
      alias: 'm',
      type: 'boolean',
      description: 'Get migration files',
    },
    seeds: {
      alias: 's',
      type: 'boolean',
      description: 'Get seed files',
    },
  }).argv;

export default args;
