import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
          {
            loader: 'shebang-loader', // Fix Unexpected character '#' in #!/usr/bin/env node
          },
        ],
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
    extensions: ['.ts', '.mjs', '.js', '.json', '.html'],
  },
  externals: [
    /^winston$/,
    /^winston-daily-rotate-file$/,
    /^supports-color$/,
    /^moment$/,
    /^moment-timezone$/,
    /^graphql$/,
    /^uuid$/,
    /^express$/,
    /^dataloader$/,
    /^@graphql-tools/,
  ],
};

export default webpackBaseConfig;
