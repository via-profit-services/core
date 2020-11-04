import { CommandModule } from 'yargs';
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
export declare type KnexArgs = KnexMigrate | KnexList | KnexMake | KnexRun;
declare const yargsModule: CommandModule<KnexArgs, KnexArgs>;
export default yargsModule;
