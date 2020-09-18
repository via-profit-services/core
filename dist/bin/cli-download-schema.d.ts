import { CommandModule } from 'yargs';
export interface DownloadSchemaArgs {
    endpoint: string;
    token: string;
    filename?: string;
    method?: string;
}
declare const yargsModule: CommandModule<DownloadSchemaArgs, DownloadSchemaArgs>;
export default yargsModule;
