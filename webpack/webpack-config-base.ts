import { Configuration, DefinePlugin } from 'webpack';

import { version } from '../package.json';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json'],
  },
  plugins: [
    new DefinePlugin({
      'process.env.CORE_VERSION': JSON.stringify(version),
    }),
  ],
  externals: [
    /^moment(|-timezone)$/,
    /^graphql(|-tools|\/.+)$/,
    /^supports-color$/,
    /^express$/,
    /^@via-profit-services\/.*/,
  ],
};

export default webpackBaseConfig;
