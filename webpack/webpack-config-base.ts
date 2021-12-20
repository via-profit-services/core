import { Configuration } from 'webpack';
import 'string-replace-loader';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /streamsearch\/lib\/sbmh\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: 'this._lookbehind = new Buffer(needle_len)',
              replace: 'this._lookbehind = Buffer.alloc(needle_len)',
            },
            {
              search: 'needle = new Buffer(needle)',
              replace: 'needle = Buffer.from(needle)',
            },
            {
              search: "chunk = new Buffer(chunk, 'binary')",
              replace: "chunk = Buffer.from(chunk, 0, 'binary')",
            },
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [
    'graphql',
    'busboy',
    'fs-capacitor',
    'supports-color',
    'express',
    '@via-profit-services/core',
  ],
};

export default webpackBaseConfig;
