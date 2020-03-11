/* eslint-disable import/no-extraneous-dependencies */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.hasTable('drivers').then(exists => {
    if (!exists) {
      return knex.schema.createTable('drivers', table => {
        table.uuid('id').primary();
        table.string('name', 255);
        table.timestamp('createdAt');
        table.timestamp('updatedAt');
      });
    }
    return Promise.resolve();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.hasTable('drivers').then(exists => {
    if (exists) {
      return knex.schema.dropTable('drivers');
    }
    return Promise.resolve();
  });
}
