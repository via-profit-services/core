/* eslint-disable import/prefer-default-export */
import * as Knex from 'knex';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { Authentificator } from '../../authentificator/authentificator';

export async function seed(knex: Knex): Promise<any> {
  return knex('accounts')
    .del()
    .then(() => {
      //   Inserts seed entries
      return knex('accounts').insert([
        {
          id: uuidv4(),
          name: 'Vasily Novosad',
          login: 'dhs',
          password: Authentificator.cryptUserPassword('dhs'),
          createdAt: moment.tz(process.env.DB_TIMEZONE).format(),
          updatedAt: moment.tz(process.env.DB_TIMEZONE).format(),
          status: 'allowed',
          type: 'stuff',
          roles: knex.raw("'[]'"),
          cursor: knex.raw('DEFAULT'),
          comment: 'Account was created with KNEX seed file from module via-profit-services/core',
        },
      ]);
    });
}
