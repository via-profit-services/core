const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');

const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'development',
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new RemovePlugin({
      after: {
        include: [path.join(__dirname, '../dist/playground')],
      },
    }),
  ],
  externals: [nodeExternals()],
});
