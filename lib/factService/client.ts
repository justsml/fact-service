import knex from "../../db/knex"; // TODO: Adjust path as needed!
import UserError from "./userError";

interface IQueryParameters {
  limit?: number;
  offset?: number;
  orderBy?: [string, "asc" | "desc"];
}

interface IFactServiceQuery {
  path: string;
  key: string | string[];
}

interface IFact {
  id: number | bigint | string;
  path: string;
  key: string;
  value: object;
  created_at?: Date;
  updated_at?: Date;
}

const arrayify = <TItem>(value: TItem | TItem[]) =>
  Array.isArray(value) ? value : [value];

const FactClient = {
  getAll: ({
    limit = 50,
    offset = 0,
    orderBy = ["id", "asc"],
  }: IQueryParameters = {}) =>
    knex<IFact>("fact_store")
      .select("*")
      .limit(limit)
      .offset(offset)
      .orderBy(...(orderBy ?? ["id", "asc"]))
      .then((rows) => rows.map((row) => row)),

  getById: ( id: number | bigint) =>
    knex<IFact>("fact_store").select("*").limit(1).where('id', `${id}`),

  findByPath: (
    { path, key, limit }: IFactServiceQuery & IQueryParameters = {
      path: "",
      key: "",
      limit: 50,
    }
  ) =>
    knex("fact_store")
      .select("*")
      .limit(limit ?? 50)
      .where("path", path)
      .and
      .whereIn("key", arrayify(key)),

  create: (data: IFact) =>
    knex("fact_store")
      .insert(data)
      .returning("*")
      .catch(error => {
        if (error.message.includes("duplicate key value violates unique constraint")) {
          throw new UserError("Fact already exists!");
        }
      }),

  update: ({ id, ...data }: IFact) =>
    knex("fact_store").where({ id }).update(data),

  remove: (id: number | bigint) =>
    knex("fact_store").where('id', `${id}`).delete(),
};

export default FactClient;
