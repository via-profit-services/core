import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.graphql$/,
        use: 'raw-loader',
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
    extensions: ['.ts', '.mjs', '.js', '.json', '.graphql', '.html'],
  },
  externals: [
    /^winston(|-daily-rotate-file)$/,
    /^moment(|-timezone)$/,
    /^graphql(|-tools|\/.+)$/,
    /^supports-color$/,
    /^uuid$/,
    /^express$/,
    /^dataloader$/,

    // /\.\/schema\.graphql$/,
  ],
};

export default webpackBaseConfig;
