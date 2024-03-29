import type { ApplyMiddlewares } from '@via-profit-services/core';

const applyMiddlewares: ApplyMiddlewares = async props => {
  const { middlewares, request, schema, stats, context, extensions, config, validationRule } =
    props;
  await middlewares.reduce(async (prevMiddleware, currentMiddleware) => {
    await prevMiddleware;

    await currentMiddleware({
      stats: { ...stats },
      config: { ...config },
      request,
      extensions,
      context,
      schema,
      validationRule,
    });
  }, Promise.resolve());
};

export default applyMiddlewares;
