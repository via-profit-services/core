/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { CommandModule } from 'yargs';

import { execKnex, resolveKnexfile } from './utils/migrations';

interface KnexMigrate {
  knexfile: string;
}

interface KnexList {
  knexfile: string;
}

interface KnexMake {
  name: string;
  knexfile: string;
  stub?: string;
}

interface KnexRun {
  name: string;
  knexfile: string;
}
interface KnexRunSeeds {
  knexfile: string;
}

export type KnexArgs = KnexMigrate | KnexList | KnexMake | KnexRun;

const yargsModule: CommandModule<KnexArgs, KnexArgs> = {
  command: 'knex <command>',
  describe: 'knex-cli provider',
  handler: () => { /* */ },
  builder: (builder) => builder
      .example('$0 knex migrate latest ./knexfile.ts', 'Apply all of the next migrations')
      .command(
        'migrate <command>',
        'Apply/Undo/Make migrations',
        (migrationBuilder) => migrationBuilder
            .command<KnexMigrate>(
              'latest',
              'Apply all of the next migrations',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:latest', args.knexfile);
              },
            )
            .command<KnexMigrate>(
              'up',
              'Apply next migration',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:up', args.knexfile);
              },
            )
            .command<KnexMigrate>(
              'down',
              'Undo last single of migration',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:down', args.knexfile);
              },
            )
            .command<KnexMigrate>(
              'rollback',
              'Undo last migrations',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:rollback', args.knexfile);
              },
            )
            .command<KnexMigrate>(
              'rollback-all',
              'Undo all migrations',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:rollback --all', args.knexfile);
              },
            )
            .command<KnexList>(
              'list',
              'To list both completed and pending migrations',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('migrate:list', args.knexfile);
              },
            )
            .command<KnexMake>(
              'make',
              'Creating new migration file',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
                name: {
                  alias: 'n',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Migration filename',
                },
                stub: {
                  alias: 's',
                  type: 'string',
                  decribe: 'Template file',
                },
              }),
              async (args) => {
                const knexfileDir = path.dirname(resolveKnexfile(args.knexfile));

                const stubFile = args.stub
                  ? path.resolve(knexfileDir, args.stub)
                  : path.resolve(`${process.cwd()}/node_modules/@via-profit-services/core/dist/bin/stub/stub-migration.ts.stub`);

                if (!fs.existsSync(stubFile)) {
                  console.log(chalk.red(`Stubfile not found in «${stubFile}»`));
                  process.exit(1);
                }
                await execKnex(`migrate:make ${args.name}  --stub ${stubFile}`, args.knexfile);
              },
            ),
      )
      .command(
        'seed <command>',
        'Apply/Make seeds',
        (seedBuilder) => seedBuilder
            .command<KnexMake>(
              'make',
              'Creating new seed file',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
                name: {
                  alias: 'n',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Seed filename',
                },
                stub: {
                  alias: 's',
                  type: 'string',
                  decribe: 'Template file',
                },
              }),
              async (args) => {
                const knexfileDir = path.dirname(resolveKnexfile(args.knexfile));
                const stubFile = args.stub
                  ? path.resolve(knexfileDir, args.stub)
                  : path.resolve(`${process.cwd()}/node_modules/@via-profit-services/core/dist/bin/stub/stub-seed.ts.stub`);

                if (!fs.existsSync(stubFile)) {
                  console.log(chalk.red(`Stubfile not found in «${stubFile}»`));
                  process.exit(1);
                }

                await execKnex(`seed:make ${args.name} --stub ${stubFile}`, args.knexfile);
              },
            )
            .command<KnexRunSeeds>(
              'run-all',
              'Run all seed files',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
              }),
              async (args) => {
                await execKnex('seed:run', args.knexfile);
              },
            )
            .command<KnexRun>(
              'run <name>',
              'Run seed file',
              (b) => b.options({
                knexfile: {
                  alias: 'k',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Location of the knexfile',
                },
                name: {
                  alias: 'n',
                  type: 'string',
                  demandOption: true,
                  decribe: 'Seed filename',
                },
              }),
              async (args) => {
                await execKnex(`seed:run ${args.name}`, args.knexfile);
              },
            ),
      ),
};

export default yargsModule;
