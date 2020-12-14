import type {
  Configuration, Context, ApplicationFactory,
} from '@via-profit-services/core';
import DataLoader from 'dataloader';
import { Router } from 'express';

import {
  DEFAULT_INTROSPECTION_STATE,
  DEFAULT_SERVER_TIMEZONE,
  DEFAULT_LOG_DIR,
} from './constants';
import configureLogger from './logger/configure-logger';
import expressMiddlewares from './middleware/express';

const applicationFactory: ApplicationFactory = (props) => {
  const configurtation: Configuration = {
    timezone: DEFAULT_SERVER_TIMEZONE,
    middleware: [],
    enableIntrospection: DEFAULT_INTROSPECTION_STATE,
    logDir: DEFAULT_LOG_DIR,
    debug: process.env.NODE_ENV === 'development',
    rootValue: undefined,
    ...props,

  };


  const { timezone, logDir } = configurtation;
  const logger = configureLogger({ logDir });
  const coreDataloader = new DataLoader(async (ids: string[]) => ids.map((id) => ({
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })))

  // combine finally context object
  const context: Context = {
    timezone,
    logger,
    dataloader: {
      core: coreDataloader,
    },
  };

  const viaProfitGraphql = Router();
  viaProfitGraphql.use(expressMiddlewares(configurtation, context));

  return {
    viaProfitGraphql,
    context,
  };
}

export default applicationFactory;