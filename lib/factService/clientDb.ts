import knex from "../../db/knex"; // TODO: Adjust path as needed!
import { checkDuplicateKeyError, IQueryParameters } from "../../common/routeUtils";
import { toArray } from "../../common/arrayUtils";
import type { IFact, IFactClient, IFactServiceQuery } from "./types";

const FactDatabaseClient: IFactClient = {
  // findAll: ({
  //   limit = 50,
  //   offset = 0,
  //   orderBy = ["id", "asc"],
  // }: IQueryParameters = {}) =>
  //   knex<IFact>("fact_store")
  //     .select("*")
  //     .limit(limit)
  //     .offset(offset)
  //     .orderBy(...(orderBy ?? ["id", "asc"]))
  //     .then((rows) => rows.map((row) => row)),

  findById: (id: number | bigint) =>
    knex<IFact>("fact_store").select("*").limit(1).where("id", `${id}`)
    .then((rows) => rows[0]),

  findFactsByPathKeys: (
    { path, key, limit } = {
      path: "",
      key: "",
      limit: 50,
    }
  ) =>
    knex("fact_store")
      .select("*")
      .limit(limit ?? 50)
      .where("path", path)
      .and.whereIn("key", toArray(key)),

  findAllFactsByPath: (
    { path, limit }: { path: string } & IQueryParameters = {
      path: "",
      limit: 250,
    }
  ) =>
    knex("fact_store")
      .select("*")
      .limit(limit ?? 250)
      .where("path", path),

  create: (data: Omit<IFact, "id">) =>
    knex("fact_store")
      .insert(data)
      .returning("*")
      .catch(checkDuplicateKeyError),

  update: ({ id, ...data }: IFact) =>
    knex("fact_store").where({ id }).update(data).returning("*").catch(checkDuplicateKeyError),

  removeById: (id: number | bigint) =>
    knex("fact_store")
      .where("id", `${id}`)
      .delete()
      .then(() => ({ message: `Successfully deleted fact with id ${id}` })),
};

export default FactDatabaseClient;
