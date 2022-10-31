import axios from "axios";
import { toArray } from "../../common/arrayUtils";
import { checkDuplicateKeyError, IQueryParameters } from "../../common/routeUtils";
import type { IFact, IFactClient, IFactServiceQuery } from "./types";

const FactsConfig = {
  baseUrl: process.env.FACTS_SERVICE_URL ?? 'http://localhost:3000/api/facts',
}

const client = axios.create({ baseURL: FactsConfig.baseUrl });

const FactApiClient: IFactClient = {

  findById: (id: number | bigint) =>
    client.get<IFact>(`/${id}`).then((res) => res.data),

  findFactsByPathKeys: (
    { path, key, limit }: IFactServiceQuery & IQueryParameters = {
      path: "",
      key: "",
      limit: 50,
    }
  ) =>
    client.get<IFact[]>(`/`, {
      params: {
        path,
        key: toArray(key),
        limit,
      }
    })
      .then((res) => res.data),

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

export default FactApiClient;
