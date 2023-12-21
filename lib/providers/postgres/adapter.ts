import knex from "../../../db/knex";
import { checkPostgresError } from "../../../common/routeUtils";
import { toArray } from "../../../common/arrayUtils";
import type { Fact, FactAdapter } from "../../factService/types";
import { logger } from "../../../common/logger";

export const PostgresAdapter: FactAdapter = {
  set: async (fact) =>
    await knex<Fact>("fact_store")
      .insert(fact)
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
      .whereIn("key", toArray(key))
      .delete()
      .then((count) => ({
        success: count > 0,
        count,
        message: `Deleted any fact with an id equal to ${key}`,
      })),

  find: async ({ keyPrefix }) =>
    await knex<Fact>("fact_store")
      .select("*")
      .whereILike("key", knex.raw(`concat(?::text, '%')`, keyPrefix))
      .then((rows) => rows as Fact[]),

};
