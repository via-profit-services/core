/**
 * @via-profit-services/core
 *
 * This migration file was created by the @via-profit-services/core package
 * This migration will create `accounts` table
 */

import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.raw(`

    DROP TYPE IF EXISTS "accountStatus";
    
    CREATE TYPE "accountStatus" AS ENUM (
      'allowed',
      'forbidden'
    );

    DROP TYPE IF EXISTS "accountType";
    CREATE TYPE "accountType" AS ENUM (
      'stuff',
      'client'
    );

    DROP TABLE IF EXISTS "accounts";
    CREATE TABLE "accounts" (
      "id" uuid NOT NULL,
      "name" varchar(100) NOT NULL,
      "login" varchar(100) NOT NULL,
      "password" varchar(255) NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "status" "accountStatus" NOT NULL DEFAULT 'allowed'::"accountStatus",
      "type" "accountType" NOT NULL DEFAULT 'client'::"accountType",
      "roles" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "deleted" boolean NOT NULL DEFAULT false,
      "comment" text NULL,
      CONSTRAINT accounts_pkey PRIMARY KEY (id)
    );
 
    CREATE INDEX "accountsDeletedIndex" ON accounts USING btree (deleted);

  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.raw(`
    DROP TABLE IF EXISTS "accounts" CASCADE;
    DROP TYPE IF EXISTS "accountStatus" CASCADE;
    DROP TYPE IF EXISTS "accountType" CASCADE;
  `);
}
