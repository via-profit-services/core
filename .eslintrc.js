/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  extends: [
    '@via-profit-services/eslint-config',
  ],
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, './webpack/webpack.config.base.js'),
      },
    },
  },
};