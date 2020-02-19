import fs from 'fs';
import path from 'path';
import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const packageJson = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), 'utf8');
const packageInfo = JSON.parse(packageJson) as IPackage;

const DevInfo = new GraphQLObjectType({
  name: 'DevInfo',
  fields: () => ({
    name: {
      description: 'Application name',
      resolve: () => packageInfo.name,
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      description: 'Application description',
      resolve: () => packageInfo.description,
      type: new GraphQLNonNull(GraphQLString),
    },
    version: {
      description: 'Application version number',
      resolve: () => packageInfo.version,
      type: new GraphQLNonNull(GraphQLString),
    },
    author: {
      description: 'Application author',
      resolve: () => packageInfo.author,
      type: new GraphQLNonNull(GraphQLString),
    },
    support: {
      description: 'Application support',
      resolve: () => packageInfo.support,
      type: new GraphQLNonNull(GraphQLString),
    },
    license: {
      description: 'Application license',
      resolve: () => packageInfo.license,
      type: new GraphQLNonNull(GraphQLString),
    },
    repository: {
      resolve: () => packageInfo.repository,
      type: new GraphQLNonNull(
        new GraphQLObjectType({
          name: 'Repository',
          description: 'Application repository',
          fields: () => ({
            type: {
              description: 'Repository type',
              type: new GraphQLNonNull(GraphQLString),
              resolve: () => packageInfo.repository.type,
            },
            url: {
              description: 'Repository URL addess',
              type: new GraphQLNonNull(GraphQLString),
              resolve: () => packageInfo.repository.url,
            },
          }),
        }),
      ),
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      devInfo: {
        description: 'Application development info',
        resolve: () => ({}),
        type: new GraphQLNonNull(DevInfo),
      },
    }),
  }),
});

export default schema;

interface IPackage {
  name: string;
  support: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
}
