import tsTransformPaths from '@zerollup/ts-transform-paths';
import path from 'path';
import ts from 'typescript';
import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              getCustomTransformers: (program: ts.Program) => {
                const transformer = tsTransformPaths(program);

                return {
                  before: [transformer.before],
                  afterDeclarations: [transformer.afterDeclarations],
                };
              },
            },
          },
          {
            loader: 'shebang-loader', // Fix Unexpected character '#' in #!/usr/bin/env node
          },
        ],
      },
      {
        test: /\.mjs$/, // fixes https://github.com/graphql/graphql-js/issues/1272
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
    extensions: ['.ts', '.mjs', '.js', '.json', '.gql', '.graphql'],
    alias: {
      '~': path.resolve(__dirname, '..', 'src'),
    },
  },
};

export default webpackBaseConfig;
