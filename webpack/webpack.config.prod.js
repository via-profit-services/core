const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const { ProgressPlugin, IgnorePlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    playground: path.resolve(__dirname, '../src/playground/playground.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new RemovePlugin({
      after: {
        include: [path.join(__dirname, '../dist/playground')],
      },
    }),
    new IgnorePlugin(/m[sy]sql2?|oracle(db)?|sqlite3/),
    new IgnorePlugin(/pg-native/),
    new IgnorePlugin(/pg-query-stream/),
  ],

  externals: [nodeExternals()],
});
