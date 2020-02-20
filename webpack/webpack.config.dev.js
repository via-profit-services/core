const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { ProgressPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    playground: path.resolve(__dirname, '../src/playground/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new NodemonPlugin({
      script: path.resolve(__dirname, '../dist/playground.js'),
      watch: path.resolve(__dirname, '../dist'),
    }),
    new CopyPlugin([{ from: 'src/playground/cert', to: 'cert' }]),
  ],
  externals: [nodeExternals()],
});
