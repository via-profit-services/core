/* eslint-disable */

class ViaProfitPlugin {

  // ignore webpack plugin template
  ignoreModules = [
    { resourceRegExp: /m[sy]sql2?|oracle(db)?|sqlite3/ },
    { resourceRegExp: /pg-native/ },
    { resourceRegExp: /pg-query-stream/ },
    { resourceRegExp: /vue/ },
  ];

  constructor() {
    this.checkIgnore = this.checkIgnore.bind(this);
  }

  checkIgnore({ request, context }) {
    let retState = undefined;
    this.ignoreModules.forEach(({ resourceRegExp, contextRegExp }) => {
      if (resourceRegExp.test(request)) {
        if (typeof contextRegExp !== 'undefined' && contextRegExp.test(context)) {
          retState = false;
        } else {
          retState = false;
        }
      }
    });

    return retState;
  }

  apply(compiler) {

    compiler.hooks.normalModuleFactory.tap('ViaProfitPlugin', nmf => {
      nmf.hooks.beforeResolve.tap('ViaProfitPlugin', this.checkIgnore);
    });

    compiler.hooks.contextModuleFactory.tap('ViaProfitPlugin', cmf => {
      cmf.hooks.beforeResolve.tap('ViaProfitPlugin', this.checkIgnore);
    });
  }
}

module.exports = ViaProfitPlugin;
