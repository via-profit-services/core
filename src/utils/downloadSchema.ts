import fs from 'fs';
import { OutgoingHttpHeaders } from 'http';
import path from 'path';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql/utilities';

export const downloadSchema = async (options: IDownloadSchemaOptions) => {
  const {
    endpoint, method, token, filename, headers,
  } = options;

  const response = await fetch(endpoint, {
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  if (response.status !== 200) {
    throw new Error(`Failed to send introspection request with status code ${response.status}`);
  }

  const schemaJSON = await response.json();
  const clientSchema = printSchema(buildClientSchema(schemaJSON.data));
  return fs.writeFileSync(path.resolve(filename), clientSchema);
};

export interface IDownloadSchemaOptions {
  endpoint: string;
  token: string;
  filename: string;
  method?: 'POST' | 'GET';
  headers?: OutgoingHttpHeaders;
}
