import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: ['graphql', 'busboy', 'supports-color', 'express', '@via-profit-services/core'],
};

export default webpackBaseConfig;
