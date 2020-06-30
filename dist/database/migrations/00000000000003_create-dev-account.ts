/* eslint-disable import/no-extraneous-dependencies */
/**
 * @via-profit-services/core
 *
 * This migration file was created by the @via-profit-services/core package
 * This migration will create development account
 */

import * as Knex from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function up(knex: Knex): Promise<any> {
  return knex('accounts').insert({
    id: uuidv4(),
    name: 'Developer',
    login: 'dev',
    password: '$2a$10$W2AIgtHMlwKtZB65S7scVuWHVxomH0KxTc47EJ0xXuJgCSvBFRnw.',
    status: 'allowed',
    type: 'stuff',
    roles: knex.raw(`'${JSON.stringify(['admin', 'developer'])}'::jsonb`),
    comment: 'Development account. Please delete this account when development is complete',
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex('accounts').del().where({
    login: 'dev',
  });
}
