/* eslint-disable import/no-extraneous-dependencies */

import { CommandModule } from 'yargs';

import { downloadSchema } from '../utils/downloadSchema';

export interface DownloadSchemaArgs {
  endpoint: string;
  token: string;
  filename?: string;
  method?: string;
}

const yargsModule: CommandModule<DownloadSchemaArgs, DownloadSchemaArgs> = {
  command: 'download-schema <endpoint> <token> [filename] [method]',
  describe: 'Download GraphQL schema by introspection',
  handler: async (args) => {
    const {
      method, token, endpoint, filename,
    } = args;
    await downloadSchema({
      token,
      endpoint,
      filename,
      method: method === 'POST' ? 'POST' : 'GET',
    });
  },
  builder: (builder) => builder
      .example(
        '$0 download-schema https://example.com/gql MyToken ./schema.graphql',
        'Download GraphQL schema into the ./schema.graphql file',
      )
      .example(
        '$0 download-schema https://example.com/gql MyToken',
        'Download GraphQL schema and return this as string',
      ),
};

export default yargsModule;
