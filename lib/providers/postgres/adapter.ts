import {
  isFactEntity,
  type FactAdapter,
  type FactEntity,
} from "../../factService/types";
import knex from "../../../db/knex";
import { checkPostgresError } from "../../../common/routeUtils";
import { logger } from "../../../common/logger";
import { toArray } from "../../../common/arrayUtils";

export const adapter: FactAdapter = {
  _name: "postgres",

  set: async (fact) =>
    await knex<FactEntity>("fact_store")
      .insert({ ...fact, updated_at: new Date() })
      .onConflict("key")
      .merge()
      .returning("*")
      .then((result) => {
        return result && result.length === 1 ? result[0] : result;
      })
      .catch((error) => {
        logger.error("ERROR %o", error);
        return checkPostgresError({ fact })(error);
      }),

  get: async ({ key }) =>
    await knex<FactEntity>("fact_store")
      .select("*")
      .where({ key })
      .first()
      .catch(checkPostgresError({ key }))
      .then((result) => {
        if (isFactEntity(result)) return result;
        return undefined;
      }),

  del: async ({ key }) =>
    Promise.all([
      toArray(key).map((key) =>
        knex<FactEntity>("fact_store").where({ key }).delete(),
      ),
    ]).then((results) => {
      return {
        success: results.length > 0,
        count: results.length,
        message: `Deleted ${results.length} fact(s):`,
      };
    }),

  find: async ({ keyPrefix }) =>
    await knex<FactEntity>("fact_store")
      .select("*")
      .limit(1_000)
      .whereILike("key", knex.raw(`concat(?::text, '%')`, keyPrefix))
      .then((rows) => (rows.every(isFactEntity) ? rows : [])),
};

export const setup = async () => {
  return knex.schema
    .createTable("fact_store", (table) => {
      table.string("key", 500).primary();
      table.jsonb("value").notNullable();

      table.timestamps(true, true);
    })
    .then(() => console.log("!!! created table fact_store !!!"))
    .catch((err) =>
      err.message.includes("already exists")
        ? "Already exists"
        : console.error(err),
    );
};

export const reset = async () => {
  return knex.schema
    .dropTableIfExists("fact_store")
    .then(() => console.log("!!! dropped table fact_store !!!"))
    .catch((err) => console.error(err));
};
