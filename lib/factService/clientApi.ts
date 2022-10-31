import axios from "axios";
import { toArray } from "../../common/arrayUtils";
import { IQueryParameters } from "../../common/routeUtils";
import type { Fact, FactClient, IFactServiceQuery } from "./types";

const FactsConfig = {
  baseUrl: process.env.FACTS_SERVICE_URL ?? "http://localhost:3000/api/facts",
};

const client = axios.create({ baseURL: FactsConfig.baseUrl });

const FactApiClient: FactClient = {
  findById: (id: number | bigint) =>
    client.get<Fact>(`/${id}`).then((res) => res.data),

  findFactsByPathKeys: ({
    path,
    key,
    limit,
  }: IFactServiceQuery & IQueryParameters) =>
    client
      .get<Fact[]>(`/`, {
        params: {
          path,
          key: toArray(key),
          limit: limit ?? 50,
        },
      })
      .then((res) => res.data),

  findAllFactsByPath: (
    { path, limit }: { path: string } & IQueryParameters = {
      path: "",
      limit: 250,
    },
  ) =>
    client
      .get<Fact[]>(`/${path}`, {
        params: {
          limit,
        },
      })
      .then((res) => res.data),

  create: (data: Omit<Fact, "id">) => axios.put(`/`, data),

  update: ({ id, ...data }: Fact) =>
    client.post<Fact[]>(`/${id}`, data).then((res) => res.data),

  removeById: (id: number | bigint) =>
    client.delete(`/${id}`).then((res) => ({ message: res.data })),
};

export default FactApiClient;
