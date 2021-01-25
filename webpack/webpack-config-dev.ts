import NodemonPlugin from 'nodemon-webpack-plugin';
import path from 'path';
import { Configuration, WebpackPluginInstance } from 'webpack';
import { merge } from 'webpack-merge';

import webpackBaseConfig from './webpack-config-base';

const webpackDevConfig: Configuration = merge(webpackBaseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/playground/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new NodemonPlugin({
      exec: process.env.DEBUG
        ? 'yarn node --inspect-brk=9229 ./build/index.js'
        : 'yarn node ./build/index.js',
      watch: ['./build'],
    }) as WebpackPluginInstance,
  ],
});

export default webpackDevConfig;
