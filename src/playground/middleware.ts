import type { Middleware } from '@via-profit-services/core';

const loggerMiddleware: Middleware = ({ context, stats }) => {
  const { emitter } = context;
  if (stats.requestCounter === 1) {
    console.log('subscribe to error events');
    emitter.on('graphql-error', msg => console.error(msg));
  }
};

const middlewares: Middleware[] = [loggerMiddleware];

export default middlewares;
