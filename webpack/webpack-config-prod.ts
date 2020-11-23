/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import { ProgressPlugin, BannerPlugin, Compiler, Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import chalk from 'chalk';

import packageInfo from '../package.json';
import webpackBaseConfig from './webpack-config-base';
import ViaProfitPlugin from '../src/webpack-plugin';

const webpackProdConfig: Configuration = merge(webpackBaseConfig, {
entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    'bin/cli': path.resolve(__dirname, '../src/bin/cli.ts'),
    'webpack-plugin': path.resolve(__dirname, '../src/webpack-plugin/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  plugins: [
    new ProgressPlugin({
      modules: true,
    }),
    new ViaProfitPlugin(),
    new BannerPlugin({
      banner: '#!/usr/bin/env node\n/* eslint-disable */',
      raw: true,
      test: /cli\.js/,
    }),
    new BannerPlugin({
      banner: `
Via Profit Services / Core

Repository ${packageInfo.repository.url}
Contact    ${packageInfo.support}
      `,
      test: /index\.js/,
    }),
    {
      apply: (compiler: Compiler) => {
        compiler.hooks.afterEmit.tapAsync('WebpackAfterBuild', (_, callback) => {

          console.log(chalk.green('chmod 755 for ../dist/bin/cli.js'));
          fs.chmodSync(path.resolve(__dirname, '../dist/bin/cli.js'), '755');

          console.log(chalk.green('Copy stub files'));
          fs.copySync(
            path.resolve(__dirname, '../src/bin/stub/'),
            path.resolve(__dirname, '../dist/bin/stub/'),
          );

          console.log(chalk.green('Copy migration files'));
          fs.copySync(
            path.resolve(__dirname, '../src/database/migrations/'),
            path.resolve(__dirname, '../dist/database/migrations/'),
          );

          callback();
        });

      },
    },
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: true,
    }),
  ],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin(),
    ],
  },
  externals: {
    moment: {
      commonjs2: 'moment',
    },
    'moment-timezone': {
      commonjs2: 'moment-timezone',
    },
    uuid: {
      commonjs2: 'uuid',
    },
  },
});

export default webpackProdConfig;
