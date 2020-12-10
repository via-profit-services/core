/* eslint-disable import/max-dependencies */
import { Configuration, Context, GraphqlMiddleware } from '@via-profit-services/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { applyMiddleware } from 'graphql-middleware';
import { performance } from 'perf_hooks';
import sessionStoreFactory from 'session-file-store';
import { v4 as uuidv4 } from 'uuid';

import { MAXIMUM_REQUEST_BODY_SIZE, HEADER_X_POWERED_BY } from '../constants';
import customFormatErrorFn from '../errorHandlers/customFormatErrorFn';
import errorMiddleware from '../errorHandlers/errorMiddleware';
import extensions from '../extensions';
import notFoundFallbackHTML from '../utils/404-fallback.html';
import { DisableIntrospectionQueries } from '../utils/disableIntrospection';
import { graphqlHTTP } from './graphql-express';

type ExpressInlineFactory = (
  config: Configuration,
  context: Context,
) => express.Router;

const expressInlineFactory: ExpressInlineFactory = (config, context) => {
  const { logger } = context;
  const {
    serverOptions, sessions, schema, middleware, enableIntrospection, debug } = config;
  const { cookieSign } = serverOptions || {};

  // cookie parser
  const expressCookieParserMiddleware = cookieParser(cookieSign);

  // sessions
  const SessionStore = sessionStoreFactory(session);
  sessions.logFn = (msg) => logger.server.info(msg);
  const expressSessionMiddleware = session({
    store: new SessionStore(sessions),
    secret: sessions.secret,
    genid: () => uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV !== 'development',
    },
  });

  // display errors
  const expressErrorMiddleware = errorMiddleware({ context });

  // cors
  const expressCorsMiddleware = cors({
    credentials: true,
    origin: (_origin, callback) => callback(null, true),
  });

  // json
  const expressJSONMiddleware = express.json({
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });

  // url encoded
  const expressUrlEncodedMiddleware = express.urlencoded({
    extended: true,
    limit: MAXIMUM_REQUEST_BODY_SIZE,
  });

  // set custome headers
  const expressHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Developer', HEADER_X_POWERED_BY);

    next();
  };

  const express404ErrorMiddleware = (req: Request, res: Response) => {
    const { url, originalUrl } = req;
    logger.server.debug('Request 404 Error', { url, originalUrl });

    return res
      .status(404)
      .header('Content-Type', 'text/html')
      .send(notFoundFallbackHTML);
  }

  // main iddleware
  const expressGraphqlMiddleware = graphqlHTTP((request) => {

    const iMiddlewares: GraphqlMiddleware[] = [];
    context.startTime = performance.now();

    const graphqlMiddlewares = middleware
      ? (Array.isArray(middleware) ? middleware : [middleware])
      : [];

    graphqlMiddlewares.forEach((middleware) => {
      iMiddlewares.push(middleware({ config, request }))
    });

    return {
      context,
      schema: applyMiddleware<any, Context, any>(schema, ...iMiddlewares),
      extensions: extensions({ debug }),
      customFormatErrorFn: (error) => customFormatErrorFn({ error, context, debug }),
      validationRules: !enableIntrospection ? [DisableIntrospectionQueries] : [],
    };
  });

  const router = Router();

  // apply express middlewares
  try {
    router.use(expressCorsMiddleware);
    router.use(expressJSONMiddleware);
    router.use(expressUrlEncodedMiddleware);
    router.use(expressCookieParserMiddleware);
    router.use(expressHeadersMiddleware);
    router.use(expressSessionMiddleware);
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
