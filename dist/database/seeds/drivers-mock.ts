/* eslint-disable import/prefer-default-export */
import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<any> {
  // Deletes ALL existing entries
  return knex('drivers')
    .del()
    .then(() => {
      // Inserts seed entries
      return knex('drivers').insert([
        {
          id: 'ca0c39f3-7ed4-43ca-93a5-712c94f9c18a',
          name: 'Ivan',
          createdAt: knex.raw('now()'),
          updatedAt: knex.raw('now()'),
        },
      ]);
    });
}
