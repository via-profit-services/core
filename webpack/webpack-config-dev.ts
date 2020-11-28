import NodemonPlugin from 'nodemon-webpack-plugin';
import path from 'path';
import { Configuration, ProgressPlugin, WebpackPluginInstance } from 'webpack';
import { merge } from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';

import webpackBaseConfig from './webpack-config-base';

const webpackDevConfig: Configuration = merge(webpackBaseConfig, {
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
    new ProgressPlugin({
      modules: true,
    }),
    new NodemonPlugin({
      verbose: true,
      script: path.resolve(__dirname, '../build/playground.js'),
      watch: [
        path.resolve(__dirname, '../build'),
      ],
    }) as WebpackPluginInstance,
  ],
  externals: [nodeExternals()],
});

export default webpackDevConfig;
