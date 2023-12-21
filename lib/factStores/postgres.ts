import knex from "../../db/knex";
import {
  checkDuplicateKeyError,
  checkInvalidInputError,
} from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactAdapter } from "../factService/types";

const FactDatabaseClient: FactAdapter = {
  create: async (fact) =>
    await knex<Fact>("fact_store")
      .insert(fact)
      .returning("*")
      .catch((error) => {
        console.error("ERROR", error);
        return checkDuplicateKeyError({ fact })(error);
      }),

  updateById: async ({ id, ...fact }) =>
    await knex<Fact>("fact_store")
      .where({ id })
      .update(fact)
      .returning("*")
      .catch(checkInvalidInputError({ fact }))
      .catch(checkDuplicateKeyError({ fact })),

  updateByPathKey: async (update, fact) =>
    await knex<Fact>("fact_store")
      .where({ path: update.path, key: `${update.key}` })
      .update(fact)
      .returning("*")
      .catch(checkInvalidInputError({ fact }))
      .catch(checkDuplicateKeyError({ fact })),

  removeById: async (id) =>
    await knex<Fact>("fact_store")
      .where("id", `${id}`)
      .delete()
      .then((count) => ({
        success: count > 0,
        count,
        message: `Deleted any fact with an id equal to ${id}`,
      })),

  getPathCounts: async () =>
    await knex<Fact>("fact_store")
      .select("path")
      .count("path")
      .groupBy("path")
      .orderBy("count", "desc")
      .then((rows) =>
        rows.reduce(
          (results, row) =>
            Object.assign(results, { [row.path]: row.count as number }),
          {},
        ),
      ),

  findFactsByPathKeys: async (
    { path, key, limit } = {
      path: "",
      key: "",
      limit: 50,
    },
  ) =>
    await knex<Fact>("fact_store")
      .select("*")
      .limit(limit ?? 50)
      .where("path", path)
      .and.whereIn("key", toArray(key) as string[]),

  findAllFactsByPath: async (
    { path, limit } = {
      path: "",
      limit: 250,
    },
  ) =>
    await knex<Fact>("fact_store")
      .select("*")
      .limit(limit ?? 250)
      .where("path", path),
};

export default FactDatabaseClient;
