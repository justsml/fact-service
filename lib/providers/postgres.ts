import knex from "../../db/knex";
import { checkPostgresError}  from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactAdapter } from "../factService/types";

const FactPostgresAdapter: FactAdapter = {
  set: async (fact) =>
    await knex<Fact>("fact_store")
      .insert(fact)
      .returning("*")
      .catch((error) => {
        console.error("ERROR", error);
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
      .whereILike("key", `?%`, keyPrefix)
      .then((rows) => rows as Fact[]),

  // getPathCounts: async () =>
  //   await knex<Fact>("fact_store")
  //     .select("path")
  //     .count("path")
  //     .groupBy("path")
  //     .orderBy("count", "desc")
  //     .then((rows) =>
  //       rows.reduce(
  //         (results, row) =>
  //           Object.assign(results, { [row.path]: row.count as number }),
  //         {},
  //       ),
  //     ),

  // findByKey: async (
  //   { path, key, limit } = {
  //     path: "",
  //     key: "",
  //     limit: 50,
  //   },
  // ) =>
  //   await knex<Fact>("fact_store")
  //     .select("*")
  //     .limit(limit ?? 50)
  //     .where("path", path)
  //     .and.whereIn("key", toArray(key) as string[]),

  // findAllFactsByPath: async (
  //   { path, limit } = {
  //     path: "",
  //     limit: 250,
  //   },
  // ) =>
  //   await knex<Fact>("fact_store")
  //     .select("*")
  //     .limit(limit ?? 250)
  // .where("path", path),
};

export default FactPostgresAdapter;
