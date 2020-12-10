import type { Context } from '@via-profit-services/core';
import { performance } from 'perf_hooks';

import type { RequestInfo } from '../middleware/graphql-express';

interface Config {
  debug?: boolean;
  info: RequestInfo & { context: Context; };
}

const queryTimeExtension = (config: Config) => {
  const { info } = config;
  const { context } = info;
  const { startTime } = context;

  const queryTimeMs = performance.now() - startTime;

  return { queryTimeMs };
}

export default queryTimeExtension;
