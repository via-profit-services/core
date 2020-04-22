/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import bcryptjs from 'bcryptjs';
import faker from 'faker/locale/ru';
import * as Knex from 'knex';
import { v4 as uuidv4 } from 'uuid';

const ACCOUNTS_QUANTITY = 100;

const randomInt = (min?: number, max?: number) => {
  const data = { min, max };

  if (typeof min === 'undefined') {
    data.min = randomInt(99999);
  }

  if (typeof max === 'undefined') {
    data.max = data.min * 2;
  }

  return Math.floor(Math.random() * (data.max - data.min + 1) + data.min);
};


export async function seed(knex: Knex): Promise<any> {
  // Deletes ALL existing entries
  return knex('accounts')
    .where('login', '<>', 'dev')
    .del()
    .then(() => {
      const data = [...new Array(ACCOUNTS_QUANTITY).keys()].map((index) => {
        const login = `user${index + 1}`;
        const password = bcryptjs.hashSync(login, bcryptjs.genSaltSync(10));

        const rules = [
          ['admin'],
          ['viewer'],
          ['operator'],
          ['manager'],
        ][randomInt(0, 3)];

        return {
          id: uuidv4(),
          name: faker.name.firstName(),
          login,
          password,
          status: 'allowed',
          type: 'stuff',
          roles: knex.raw(`'${JSON.stringify(rules)}'::jsonb`),
        };
      });

      return knex('accounts').insert(data);
    });
}
