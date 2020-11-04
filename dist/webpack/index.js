/* eslint-disable @typescript-eslint/no-var-requires */
const { IgnorePlugin } = require('webpack');

const ViaProfitCoreWebpackPlugins = [
  new IgnorePlugin({
    resourceRegExp: /m[sy]sql2?|oracle(db)?|sqlite3/,
  }),
  new IgnorePlugin({
    resourceRegExp: /pg-native/,
  }),
  new IgnorePlugin({
    resourceRegExp: /pg-query-stream/,
  }),
  new IgnorePlugin({
    resourceRegExp: /vue/,
  }),
];

module.exports = ViaProfitCoreWebpackPlugins;
