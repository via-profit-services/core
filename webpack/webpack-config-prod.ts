import path from 'path';
import fs from 'fs';
// import FileManagerPlugin from 'filemanager-webpack-plugin';
import { ProgressPlugin, BannerPlugin, Compiler } from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import packageInfo from '../package.json';
import baseConfig from './webpack-config-base';
// import ViaProfitPlugin from '../externals/webpack-plugin';
import ViaProfitPlugin from '../src/webpack-plugin';

module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    'bin/cli': path.resolve(__dirname, '../src/bin/cli.ts'),
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
    // new FileManagerPlugin({
    //   onStart: {
    //     delete: ['./dist'],
    //   },
    //   onEnd: {
    //     copy: [
    //       {
    //         source: './src/database/migrations/*',
    //         destination: './dist/database/migrations/',
    //       },
    //       {
    //         source: './src/database/seeds/*',
    //         destination: './dist/database/seeds/',
    //       },
    //       {
    //         source: './src/bin/stub/*',
    //         destination: './dist/bin/stub/',
    //       },
    //       {
    //         source: './externals/webpack-plugin/*',
    //         destination: './dist/webpack/',
    //       },
    //     ],
    //     delete: [
    //       './dist/playground',
    //       './dist/webpack-plugin',
    //     ],
    //   },
    // }),
    // chmod +x for ./bin/cli.js
    {
      apply: (compiler: Compiler) => {
        compiler.hooks.afterEmit.tapAsync('WebpackAfterBuild', (_, callback) => {
          fs.chmodSync(path.resolve(__dirname, '../dist/bin/cli.js'), '755');
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
      new TsconfigPathsPlugin({

        // configFile: path.resolve(__dirname, '../tsconfig.json'),
        // extensions: ['.ts', '.json', '.mjs', '.graphql'],
      }),
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
