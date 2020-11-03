import { CommandModule } from 'yargs';
export interface GetMigrationsArgs {
    migrations: string;
    seeds: string;
}
declare const yargsModule: CommandModule<GetMigrationsArgs, GetMigrationsArgs>;
export default yargsModule;
