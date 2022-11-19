import knex from "../../db/knex";
import {
  checkDuplicateKeyError,
  checkInvalidInputError,
} from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactService } from "./types";

const FactDatabaseClient: FactService = {
  create: (fact) =>
    knex<Fact>("fact_store")
      .insert(fact)
      .returning("*")
      .catch((error) => {
        console.error("ERROR", error);
        return checkDuplicateKeyError({ fact })(error);
      }),

  updateById: ({ id, ...fact }) =>
    knex<Fact>("fact_store")
      .where({ id })
      .update(fact)
      .returning("*")
      .catch(checkInvalidInputError({ fact }))
      .catch(checkDuplicateKeyError({ fact })),

  updateByPathKey: (update, fact) =>
    knex<Fact>("fact_store")
      .where({ path: update.path, key: `${update.key}` })
      .update(fact)
      .returning("*")
      .catch(checkInvalidInputError({ fact }))
      .catch(checkDuplicateKeyError({ fact })),

  removeById: (id) =>
    knex<Fact>("fact_store")
      .where("id", `${id}`)
      .delete()
      .then((count) => ({
        success: count > 0,
        count,
        message: `Deleted any fact with an id equal to ${id}`,
      })),

  getPathCounts: () =>
    knex<Fact>("fact_store")
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

  findFactsByPathKeys: (
    { path, key, limit } = {
      path: "",
      key: "",
      limit: 50,
    },
  ) =>
    knex<Fact>("fact_store")
      .select("*")
      .limit(limit ?? 50)
      .where("path", path)
      .and.whereIn("key", toArray(key) as string[]),

  findAllFactsByPath: (
    { path, limit } = {
      path: "",
      limit: 250,
    },
  ) =>
    knex<Fact>("fact_store")
      .select("*")
      .limit(limit ?? 250)
      .where("path", path),
};

export default FactDatabaseClient;
