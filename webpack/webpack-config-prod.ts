import path from 'path';
import { BannerPlugin, Configuration } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import packageInfo from '../package.json';
import webpackBaseConfig from './webpack-config-base';

const webpackProdConfig: Configuration = merge(webpackBaseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  plugins: [
    new BannerPlugin({
      banner: `
Via Profit Services / Core

Repository ${packageInfo.repository.url}
Contact    ${packageInfo.support}
      `,
      test: /index\.js/,
    }),
    // {
    //   apply: (compiler: Compiler) => {
    //     compiler.hooks.afterEmit.tapAsync('WebpackAfterBuild', (_, callback) => {

    //       console.log(chalk.green('chmod 755 for ../dist/bin/cli.js'));
    //       fs.chmodSync(path.resolve(__dirname, '../dist/bin/cli.js'), '755');

    //       console.log(chalk.green('Copy stub files'));
    //       fs.copySync(
    //         path.resolve(__dirname, '../src/bin/stub/'),
    //         path.resolve(__dirname, '../dist/bin/stub/'),
    //       );

    //       console.log(chalk.green('Copy migration files'));
    //       fs.copySync(
    //         path.resolve(__dirname, '../src/database/migrations/'),
    //         path.resolve(__dirname, '../dist/database/migrations/'),
    //       );

    //       callback();
    //     });

    //   },
    // },
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: true,
    }) as any,
  ],
  externals: {
    'supports-color': 'supports-color',
    'moment-timezone': 'moment-timezone',
    graphql: 'graphql',
    moment: 'moment',
    uuid: 'uuid',
    express: 'express',
  },
});

export default webpackProdConfig;
