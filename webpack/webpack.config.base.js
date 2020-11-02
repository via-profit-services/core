const path = require('path');
const tsTransformPaths = require('@zerollup/ts-transform-paths');

module.exports = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(
                __dirname,
                process.env.NODE_ENV === 'development' ? '../tsconfig.json' : '../tsconfig.prod.json',
              ),
              getCustomTransformers: (program) => {
                const transformer = tsTransformPaths(program);

                return {
                  // for updating paths in generated code
                  before: [transformer.before],
                  // for updating paths in declaration files
                  afterDeclarations: [transformer.afterDeclarations],
                };
              },
            },
          },
          {
            loader: 'shebang-loader',
          },
        ],
      },
      {
        test: /\.mjs$/, // fixes https://github.com/graphql/graphql-js/issues/1272
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
    extensions: ['.ts', '.mjs', '.js', '.json', '.gql', '.graphql'],
    alias: {
      '~': path.resolve(__dirname, '..', 'src'),
    },
  },
};
