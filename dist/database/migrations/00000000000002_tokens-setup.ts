/* eslint-disable import/no-extraneous-dependencies */
/**
 * @via-profit-services/core
 *
 * This migration file was created by the @via-profit-services/core package
 * This migration will create `tokens` table
 */

export async function up(knex: any): Promise<any> {
  return knex.raw(`

    DROP TYPE IF EXISTS "tokenType";
    CREATE TYPE "tokenType" AS ENUM (
      'access',
      'refresh'
    );

    
    DROP TABLE IF EXISTS  tokens;

    CREATE TABLE tokens (
      "type" "tokenType" NOT NULL DEFAULT 'access'::"tokenType",
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "expiredAt" timestamptz NOT NULL,
      "account" uuid NULL,
      "id" uuid NOT NULL,
      "associated" uuid NULL,
      "deviceInfo" jsonb NULL,
      CONSTRAINT tokens_pk PRIMARY KEY (id)
    );

    ALTER TABLE tokens ADD CONSTRAINT tokens_account_fk FOREIGN KEY (account) REFERENCES accounts(id) ON DELETE CASCADE;
    ALTER TABLE tokens ADD CONSTRAINT tokens_associated_fk FOREIGN KEY (associated) REFERENCES tokens(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: any): Promise<any> {
  return knex.raw(`
    DROP TABLE IF EXISTS "tokens" CASCADE;
    DROP TYPE IF EXISTS "tokenType" CASCADE;
  `);
}
