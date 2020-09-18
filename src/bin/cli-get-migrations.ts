/* eslint-disable import/no-extraneous-dependencies */

import { CommandModule } from 'yargs';
import { getMigrations } from './utils/migrations';

export interface GetMigrationsArgs {
  migrations: boolean;
  seeds: boolean;
}

const yargsModule: CommandModule<GetMigrationsArgs, GetMigrationsArgs> = {
  command: 'get-migrations',
  describe: 'Copy all migration and/or seed files from @via-profit-services modules into your project',
  handler: async (args) => getMigrations(args),
  builder: (builder) => {
    return builder
      .options({
        migrations: {
          alias: 'm',
          type: 'boolean',
        },
        seeds: {
          alias: 's',
          type: 'boolean',
        },
      })
      .example('$0 get-migrations -m', 'Copy all migration files into your project')
      .example('$0 get-migrations -s', 'Copy all seed files into your project')
      .example('$0 get-migrations -m -s', 'Copy all migration and seed files into your project');
  },
};

export default yargsModule;
