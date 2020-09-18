import { CommandModule } from 'yargs';
export interface GetMigrationsArgs {
    migrations: boolean;
    seeds: boolean;
}
declare const yargsModule: CommandModule<GetMigrationsArgs, GetMigrationsArgs>;
export default yargsModule;
