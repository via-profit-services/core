/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: {
    index: path.resolve(__dirname, '../index.ts'),
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
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
  },
  externals: [nodeExternals()],
};
