import { performance } from 'perf_hooks';
import knex, { PgConnectionConfig, MigratorConfig, SeedsConfig } from 'knex';
import moment from 'moment-timezone';
import { types } from 'pg';
import { ServerError } from '../errorHandlers';
import { ILoggerCollection } from '../logger';
import { DATABASE_CHARSET, DATABASE_CLIENT } from '../utils';

const ENABLE_PG_TYPES = true;
const DEFAULT_TIMEZONE = 'UTC';

export const knexProvider = (config: IDBConfig) => {
  const {
    connection, logger, timezone, localTimezone,
  } = config;
  const times: { [key: string]: any } = {};

  if (ENABLE_PG_TYPES) {
    // Timestamp
    types.setTypeParser(types.builtins.TIMESTAMP, 'text', (value) => moment.tz(value, localTimezone).toDate());

    // timestamptz
    types.setTypeParser(types.builtins.TIMESTAMPTZ, 'text', (value) => moment.tz(value, localTimezone).toDate());

    // Numeric to float
    types.setTypeParser(types.builtins.NUMERIC, parseFloat);

    logger.server.debug('pg-types configured');
  }

  logger.server.debug('Try to Database server connect');
  const instance = knex({
    client: DATABASE_CLIENT,
    connection,
    pool: {
      afterCreate: (conn: any, done: Function) => {
        conn.query(
          `
            SET TIMEZONE = '${timezone || DEFAULT_TIMEZONE}';
            SET CLIENT_ENCODING = ${DATABASE_CHARSET};
          `,
          (err: any) => {
            if (err) {
              logger.sql.debug('Connection error', { err });
            } else {
              logger.sql.debug(`The TIMEZONE was set to "${timezone || DEFAULT_TIMEZONE}"`);
              logger.sql.debug(`The charset was set to "${DATABASE_CHARSET}"`);
            }

            done(err, conn);
          },
        );
      },
    },
  });

  instance
    .on('query', (query) => {
      // eslint-disable-next-line no-underscore-dangle
      const uid = query.__knexQueryUid;

      times[uid] = {
        startTime: performance.now(),
      };
    })
    .on('query-response', (response, query, builder) => {
      // eslint-disable-next-line no-underscore-dangle
      const uid = query.__knexQueryUid;
      const queryTime = performance.now() - times[uid].startTime;

      logger.sql.debug(builder.toString(), { queryTime });
    })
    .on('query-error', (err, query) => {
      logger.sql.error(query.sql, { err, bindings: query.bindings });
    });

  logger.server.debug('Knex provider configured');

  instance
    .raw('SELECT 1+1 AS result')
    .then(() => {
      logger.server.debug('Test the connection by trying to authenticate is OK');
      return true;
    })
    .catch((err) => {
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
  timezone?: string;
  localTimezone: string;
  migrations?: MigratorConfig;
  seeds?: SeedsConfig;
}
