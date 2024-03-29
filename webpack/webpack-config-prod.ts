import fs from 'node:fs';
import path from 'node:path';
import { BannerPlugin, Configuration, Compiler } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import { repository, support } from '../package.json';
import webpackBaseConfig from './webpack-config-base';

const webpackProdConfig: Configuration = merge(webpackBaseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  optimization: {
    nodeEnv: false,
    minimize: false,
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

Repository ${repository.url}
Contact    ${support}
      `,
      test: /index\.js/,
    }),
    {
      apply: (compiler: Compiler) => {
        compiler.hooks.beforeRun.tapAsync('WebpackBeforeBuild', (_, callback) => {
          if (fs.existsSync(path.join(__dirname, '../dist/'))) {
            fs.rmSync(path.join(__dirname, '../dist/'), { recursive: true });
          }

          callback();
        });

        compiler.hooks.afterEmit.tapAsync('WebpackAfterBuild', (_, callback) => {
          fs.copyFileSync(
            path.resolve(__dirname, '../src/@types/index.d.ts'),
            path.resolve(__dirname, '../dist/index.d.ts'),
          );
          callback();
        });
      },
    },
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: true,
    }) as any,
  ],
});

export default webpackProdConfig;
