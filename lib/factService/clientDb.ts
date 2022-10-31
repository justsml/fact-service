import knex from "../../db/knex"; // TODO: Adjust path as needed!
import { checkDuplicateKeyError } from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactClient } from "./types";

const FactDatabaseClient: FactClient = {
  findById: (id) =>
    knex<Fact>("fact_store")
      .select("*")
      .limit(1)
      .where("id", `${id}`)
      .then((rows) => rows[0]),

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
      .then(() => ({ message: `Successfully deleted fact with id ${id}` })),
};

export default FactDatabaseClient;
