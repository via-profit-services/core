/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { ProgressPlugin, IgnorePlugin, BannerPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const packageInfo = require('../package.json');
const baseConfig = require('./webpack.config.base');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    'bin/cli': path.resolve(__dirname, '../src/bin/cli.ts'),
    // playground: path.resolve(__dirname, '../src/playground/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  plugins: [
    new ProgressPlugin(),
    new IgnorePlugin(/m[sy]sql2?|oracle(db)?|sqlite3/),
    new IgnorePlugin(/pg-native/),
    new IgnorePlugin(/pg-query-stream/),
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
    new FileManagerPlugin({
      onStart: {
        delete: ['./dist'],
      },
      onEnd: {
        copy: [
          {
            source: './src/database/migrations/*',
            destination: './dist/database/migrations/',
          },
          {
            source: './src/database/seeds/*',
            destination: './dist/database/seeds/',
          },
          {
            source: './src/bin/stub/*',
            destination: './dist/bin/stub/',
          },
        ],
        delete: ['./dist/playground'],
      },
    }),
    // chmod +x for ./bin/cli.js
    {
      apply: (compiler) => {
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

  externals: [nodeExternals()],
});
