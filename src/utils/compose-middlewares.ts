import type { Middleware } from '@via-profit-services/core';

type ComposeMiddlewares = (...args: Array<Middleware | Middleware[]>) => Middleware[];

const composeMiddlewares: ComposeMiddlewares = (...args) => {
  let middlewaresArray: Middleware[] = [];

  [...args].map(middleware => {
    const middlewares = middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : [];

    middlewaresArray = middlewaresArray.concat(middlewares);
  });

  return middlewaresArray;
};

export default composeMiddlewares;
