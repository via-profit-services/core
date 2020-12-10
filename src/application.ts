import type {
  Configuration, Context, ApplicationFactory,
} from '@via-profit-services/core';
import DataLoader from 'dataloader';
import { Router } from 'express';

import {
  DEFAULT_SERVER_PORT,
  DEFAULT_INTROSPECTION_STATE,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_LOG_DIR,
  DEFAULT_SESSION_PATH,
  DEFAULT_SESSION_SECRET,
  DEFAULT_SESSION_TTL,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PASSWORD,
  DEFAULT_REDIS_PORT,
} from './constants';
import configureLogger from './logger/configure-logger';
import expressMiddlewares from './middleware';
import { pubsubFactory, subscriptionsFactory } from './subscriptions';

const applicationFactory: ApplicationFactory = (props) => {
  const defaultProps = {
    port: DEFAULT_SERVER_PORT,
    timezone: DEFAULT_SERVER_TIMEZONE,
    enableIntrospection: DEFAULT_INTROSPECTION_STATE,
    logDir: DEFAULT_LOG_DIR,
    debug: process.env.NODE_ENV === 'development',
    sessions: {
      path: DEFAULT_SESSION_PATH,
      ttl: DEFAULT_SESSION_TTL,
      secret: DEFAULT_SESSION_SECRET,
      ...props.sessions,
    },
    redis: {
      host: DEFAULT_REDIS_HOST,
      port: DEFAULT_REDIS_PORT,
      password: DEFAULT_REDIS_PASSWORD,
      ...props.redis,
    },
  };


  const configurtation: Configuration = { ...defaultProps, ...props };
  const { timezone, logDir, server } = configurtation;

  const logger = configureLogger({ logDir });
  const { redis, pubsub } = pubsubFactory(configurtation, logger);
  const coreDataloader = new DataLoader(async (ids: string[]) => ids.map((id) => ({
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })))

  // combine finally context object
  const context: Context = {
    timezone,
    startTime: 0,
    logger,
    redis,
    pubsub,
    dataloader: {
      core: coreDataloader,
    },
  };

  const application = Router();
  application.use(expressMiddlewares(configurtation, context));

  subscriptionsFactory(server, configurtation, context);


  setInterval(() => {
    pubsub.publish('info', {
      info: 'Some string',
    })
  }, 2000)

  return application;
}

export default applicationFactory;