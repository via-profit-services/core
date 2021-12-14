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
  // node: {
  //   __filename: true,
  //   __dirname: true,
  // },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  externals: [
    /^graphql$/,
    /^@graphql-tools\/.*/,
    /^supports-color$/,
    /^express$/,
    /^@via-profit-services\/.*/,
  ],
};

export default webpackBaseConfig;
