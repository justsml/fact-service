import type { Fact, FactAdapter } from "../../factService/types";
import knex from "../../../db/knex";
import { checkPostgresError } from "../../../common/routeUtils";
import { logger } from "../../../common/logger";

export const adapter: FactAdapter = {
  _name: "postgres",

  set: async (fact) =>
    await knex<Fact>("fact_store")
      .insert({ ...fact, updated_at: new Date() })
      .onConflict("key")
      .merge()
      .returning("*")
      .then((result) => {
        return result && result.length === 1 ? result[0] : result;
      })
      .catch((error) => {
        logger.error("ERROR", error);
        return checkPostgresError({ fact })(error);
      }),

  get: async ({ key }) =>
    await knex<Fact>("fact_store")
      .select("*")
      .where({ key })
      .first()
      .catch(checkPostgresError({ key })),

  del: async ({ key }) =>
    await knex<Fact>("fact_store")
      // .whereIn("key", toArray(key))
      .where({ key: key })
      .delete()
      .then((count) => {
        // console.log("delete.result:", count);
        return {
          success: count > 0,
          count,
          message: `Deleted any fact with an id equal to ${key}`,
        };
      }),

  find: async ({ keyPrefix }) =>
    await knex<Fact>("fact_store")
      .select("*")
      .whereILike("key", knex.raw(`concat(?::text, '%')`, keyPrefix))
      .then((rows) => rows as Fact[]),
};

export const setup = async () => {
  return knex.schema
    .createTable("fact_store", (table) => {
      table.string("key", 500).primary();
      table.jsonb("value").notNullable();

      table.timestamps(true, true);
    })
    .then(() => console.log("!!! created table fact_store !!!"))
    .catch((err) => console.error(err));
};

export const reset = async () => {
  return knex.schema
    .dropTableIfExists("fact_store")
    .then(() => console.log("!!! dropped table fact_store !!!"))
    .catch((err) => console.error(err));
};
