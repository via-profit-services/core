/* eslint-disable arrow-body-style */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';

export const replaceEnv = (content: string) => {
  return content.replace(/\$\{([A-Z0-9_]+)\}/gi, (match, name) => {
    return process.env[name] ? String(process.env[name]) : name;
  });
};


export const loadGraphQLConfig = (filename: string) => {
  if (!fs.existsSync(filename)) {
    throw new Error(`GraphQL config file ${filename} not found`);
  }

  const configContent = fs.readFileSync(path.resolve(__dirname, '../../.graphqlconfig'), 'utf8');
  try {
    const graphQLConfig = JSON.parse(replaceEnv(configContent));

    return graphQLConfig;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to parse GraphQL config file ${filename}`);
  }
};
