import path from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import webpackNodeExternals from 'webpack-node-externals';

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
  externals: webpackNodeExternals(),
});

export default webpackDevConfig;
