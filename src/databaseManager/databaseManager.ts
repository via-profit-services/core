import { performance } from 'perf_hooks';
import knex from 'knex';
import { ILoggerCollection, ServerError } from '~/logger';

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
      logger.sql.debug(query.sql, { bindings: query.bindings, ...times[uid] });
    })
    .on('query-error', (err, query) => {
      console.log(query);
      logger.sql.error(query.sql, { bindings: query.bindings, err });
    });

  instance
    .raw('SELECT 1+1 AS result')
    .then(() => {
      logger.server.debug('Test the connection by trying to authenticate is OK');
      return true;
    })
    .catch(err => {
      logger.server.error(err.name, err);
      throw new ServerError(err);
    });

  return instance;
};

export default knexProvider;
export { knexProvider };

export type DBConfig = knex.Config;
export type KnexInstance = knex;

export interface IConfig {
  logger: ILoggerCollection;
  database: DBConfig;
}
