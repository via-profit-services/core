import path from 'path';
import { Configuration, ProgressPlugin, WebpackPluginInstance } from 'webpack';
import { merge } from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';

import webpackBaseConfig from './webpack-config-base';

const webpackDevConfig: Configuration = merge(webpackBaseConfig, {
entry: {
    playground: path.resolve(__dirname, '../src/playground.ts'),
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [

    // new NodemonPlugin({
    //   verbose: true,
    //   script: path.resolve(__dirname, '../build/playground.js'),
    //   watch: [
    //     path.resolve(__dirname, '../build'),
    //   ],
    // }) as WebpackPluginInstance,
  ],
  externals: {
    'supports-color': 'supports-color',
  //   'moment-timezone': 'moment-timezone',
  //   moment: 'moment',
  //   uuid: 'uuid',
  //   express: 'express',
  },
});

export default webpackDevConfig;
