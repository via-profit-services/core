import { Knex } from '../databaseManager';
import { configureApp } from './configureApp';

const { database } = configureApp();
const { timezone, ...dbConfig } = database;

const CHARSET = 'UTF8';
const CLIENT = 'pg';

const config: Knex.Config = {
  client: CLIENT,
  ...dbConfig,
  pool: {
    afterCreate: (conn: any, done: Function) => {
      conn.query(
        `
          SET TIMEZONE = '${timezone}';
          SET CLIENT_ENCODING = ${CHARSET};
        `,
        (err: any) => {
          done(err, conn);
        },
      );
    },
  },
};

module.exports = config;
