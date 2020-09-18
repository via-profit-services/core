#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import yargs from 'yargs';

import downloadSchemaCommand, { DownloadSchemaArgs } from './cli-download-schema';
import getMigrationsCommand, { GetMigrationsArgs } from './cli-get-migrations';
import knexCommand, { KnexArgs } from './cli-knex';

type Args = DownloadSchemaArgs | GetMigrationsArgs | KnexArgs;

const args = yargs
  .command<Args>(downloadSchemaCommand)
  .command<Args>(getMigrationsCommand)
  .command<Args>(knexCommand)
  .help()
  .argv;

export default args;
