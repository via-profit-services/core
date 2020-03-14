import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.raw(`

    DROP TYPE IF EXISTS "tokenType";
    CREATE TYPE "tokenType" AS ENUM (
      'access',
      'refresh'
    );

    
    DROP TABLE IF EXISTS  tokens;

    CREATE TABLE tokens (
      "type" "tokenType" NOT NULL DEFAULT 'access'::"tokenType",
      "createdAt" timestamp NOT NULL DEFAULT now(),
      account uuid NULL,
      id uuid NOT NULL,
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      associated uuid NULL,
      "deviceInfo" json NULL,
      "expiredAt" timestamp NOT NULL,
      CONSTRAINT tokens_pk PRIMARY KEY (id)
    );

    ALTER TABLE tokens ADD CONSTRAINT tokens_account_fk FOREIGN KEY (account) REFERENCES accounts(id) ON DELETE CASCADE;
    ALTER TABLE tokens ADD CONSTRAINT tokens_associated_fk FOREIGN KEY (associated) REFERENCES tokens(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.raw(`
    DROP TABLE IF EXISTS "tokens" CASCADE;
    DROP TYPE IF EXISTS "tokenType" CASCADE;
  `);
}
