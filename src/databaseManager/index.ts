import { performance } from 'perf_hooks';
import knex from 'knex';
import { ILoggerCollection } from '~/logger';

const knexProvider = (config: IConfig) => {
  const { database, logger } = config;
  const times: { [key: string]: any } = {};
  let count = 0;
  const instance = knex(database);

  instance
    .on('query', query => {
      // eslint-disable-next-line no-underscore-dangle
      const uid = query.__knexQueryUid;

      times[uid] = {
        position: count,
        query,
        startTime: performance.now(),
        finished: false,
      };
      count += 1;
    })
    .on('query-response', (response, query) => {
      // eslint-disable-next-line no-underscore-dangle
      const uid = query.__knexQueryUid;
      times[uid].endTime = performance.now();
      times[uid].finished = true;

      logger.sql.debug(query.sql, times[uid]);
    })
    .on('query-error', (err, query) => {
      logger.sql.error(query.sql, { err });
    });

  return instance;
};

export default knexProvider;
export { knexProvider };

export type DBConfig = knex.Config;
export type KnexInstance = knex;

interface IConfig {
  logger: ILoggerCollection;
  database: DBConfig;
}
