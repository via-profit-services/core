/* eslint-disable import/no-extraneous-dependencies */

import { CommandModule } from 'yargs';

import { getMigrations } from './utils/migrations';

export interface GetMigrationsArgs {
  migrations: string;
  seeds: string;
}

const yargsModule: CommandModule<GetMigrationsArgs, GetMigrationsArgs> = {
  command: 'get-migrations',
  describe: 'Copy migration and/or seed files from @via-profit-services modules into your project',
  handler: async (args) => getMigrations(args),
  builder: (builder) => builder
      .options({
        migrations: {
          alias: 'm',
          type: 'string',
        },
        seeds: {
          alias: 's',
          type: 'string',
        },
      })
      .example('$0 get-migrations -m ./database/migrations', 'Copy all migration files into your project')
      .example('$0 get-migrations -s ./database/seeds', 'Copy all seed files into your project'),
};

export default yargsModule;
