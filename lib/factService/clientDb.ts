import knex from "../../db/knex";
import { checkDuplicateKeyError } from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactService } from "./types";

const FactDatabaseClient: FactService = {
  create: (fact) =>
    knex<Fact>("fact_store")
      .insert(fact)
      .returning("*")
      .catch(checkDuplicateKeyError),

  update: ({ id, ...fact }) =>
    knex<Fact>("fact_store")
      .where({ id })
      .update(fact)
      .returning("*")
      .catch(checkDuplicateKeyError),

  removeById: (id) =>
    knex<Fact>("fact_store")
      .where("id", `${id}`)
      .delete()
      .then(() => ({ message: `Deleted any fact with an id equal to ${id}` })),

  getUniquePathCounts: () =>
    knex<{path: string, count: string | number}>("fact_store")
      .select("path")
      .count("path")
      .groupBy("path")
      .orderBy("count", "desc")
      .then((rows) => rows.map((row) => ({ path: row.path, count: row.count }))),

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
      .and.whereIn("key", toArray(key)),

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
