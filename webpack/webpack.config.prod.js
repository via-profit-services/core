const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { ProgressPlugin, IgnorePlugin, BannerPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
const baseConfig = require('./webpack.config.base');

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
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: [/cli\.js/],
      }),
    ],
  },
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
        ],
        delete: ['./dist/playground'],
      },
    }),
    new WebpackShellPlugin({
      onBuildEnd: ['chmod +x ./dist/bin/cli.js'],
    }),
  ],

  externals: [nodeExternals()],
});
