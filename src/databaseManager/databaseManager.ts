import { performance } from 'perf_hooks';
import knex, { PgConnectionConfig, MigratorConfig, SeedsConfig } from 'knex';
import moment from 'moment-timezone';
import { types } from 'pg';
import { ServerError } from '../errorHandlers';
import { ILoggerCollection } from '../logger';
import { DATABASE_CHARSET, DATABASE_CLIENT } from '../utils';

const ENABLE_PG_TYPES = true;

export const knexProvider = (config: IDBConfig) => {
  const { connection, logger, timezone, localTimezone } = config;
  const times: { [key: string]: any } = {};

  if (ENABLE_PG_TYPES) {
    // Timestamp
    types.setTypeParser(types.builtins.TIMESTAMP, 'text', value => {
      return moment.tz(value, localTimezone).toDate();
    });

    // timestamptz
    types.setTypeParser(types.builtins.TIMESTAMPTZ, 'text', value => {
      return moment.tz(value, localTimezone).toDate();
    });

    // Numeric to float
    types.setTypeParser(types.builtins.NUMERIC, parseFloat);

    logger.server.debug('pg-types configured');
  }

  let count = 0;
  const instance = knex({
    client: DATABASE_CLIENT,
    connection,
    pool: {
      afterCreate: (conn: any, done: Function) => {
        conn.query(
          `
            SET TIMEZONE = '${timezone}';
            SET CLIENT_ENCODING = ${DATABASE_CHARSET};
          `,
          (err: any) => {
            if (err) {
              logger.sql.debug('Connection error', { err });
            } else {
              logger.sql.debug(`The TIMEZONE was set to "${timezone}"`);
              logger.sql.debug(`The charset was set to "${DATABASE_CHARSET}"`);
            }

            done(err, conn);
          },
        );
      },
    },
  });

  instance
    .on('query', query => {
      // eslint-disable-next-line no-underscore-dangle
      const uid = query.__knexQueryUid;

      times[uid] = {
        position: count,
        // query,
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

  logger.server.debug('Knex provider configured');

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

export type KnexInstance = knex;

export interface IDBConfig {
  logger: ILoggerCollection;
  connection: PgConnectionConfig;
  timezone: string;
  localTimezone: string;
  migrations?: MigratorConfig;
  seeds?: SeedsConfig;
}
