const path = require('path');
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
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new ProgressPlugin(),
    new NodemonPlugin({
      script: path.resolve(__dirname, '../build/playground.js'),
      watch: path.resolve(__dirname, '../build'),
      verbose: true,
    }),
  ],
  externals: [nodeExternals()],
});
