import type { Configuration, Context } from '@via-profit-services/core';
import express, { Router, Request, Response } from 'express';

import { MAXIMUM_REQUEST_BODY_SIZE } from '../constants';
import errorMiddleware from '../errorHandlers/errorMiddleware';
import notFoundFallbackHTML from '../utils/404-fallback.html';
import applyMiddlewares from '../utils/apply-middlewares';
import composeMiddlewares from '../utils/compose-middlewares';
import expressGraphqlMiddlewareFactory from './express-graphql';
import graphqlIntrospectionMiddleware from './graphql-introspection';

type ExpressInlineFactory = (
  config: Configuration,
  context: Context,
) => express.Router;

const expressInlineFactory: ExpressInlineFactory = (config, context) => {
  const { logger } = context;
  const { schema, debug, rootValue, middleware } = config;

  // display errors
  const expressErrorMiddleware = errorMiddleware({ context });

  // json
  const expressJSONMiddleware = express.json({
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });

  // url encoded
  const expressUrlEncodedMiddleware = express.urlencoded({
    extended: true,
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });


  // 404 fallback
  const express404ErrorMiddleware = (req: Request, res: Response) => {
    const { url, originalUrl } = req;
    logger.server.debug('Request 404 Error', { url, originalUrl });

    return res
      .status(404)
      .header('Content-Type', 'text/html')
      .send(notFoundFallbackHTML);
  }

  const middlewaresResponse = applyMiddlewares({
    middleware: composeMiddlewares(middleware, graphqlIntrospectionMiddleware),
    context,
    config,
    schema,
  });

  const expressGraphqlMiddleware = expressGraphqlMiddlewareFactory({
    validationRules: middlewaresResponse.validationRules,
    context: middlewaresResponse.context,
    rootValue,
    schema,
    debug,
  });

  const router = Router();

  try {
    router.use(expressJSONMiddleware);
    router.use(expressUrlEncodedMiddleware);
    router.use(expressGraphqlMiddleware);
    router.use(expressErrorMiddleware);
    router.use('*', express404ErrorMiddleware);
  } catch (err) {
    logger.server.error('Failed to apply express middlewares')
    if (debug) {
      console.error(err);
    }
  }

  return router;
}

export default expressInlineFactory;
