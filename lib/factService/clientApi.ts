import axios from "axios";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactService, PathCountResults } from "./types";

const FactsConfig = {
  baseUrl: process.env.FACTS_SERVICE_URL ?? "http://localhost:3000/api/facts",
};

const client = axios.create({ baseURL: FactsConfig.baseUrl });

const enc = encodeURIComponent;

/**
 * This is the HTTP client for the FactService.
 */
const FactApiClient: FactService = {
  create: (fact) => client.put(`/`, fact),

  updateById: ({ id, ...fact }) =>
    client.post<Fact[]>(`/${Number(id)}`, fact).then((res) => res.data),

  updateByPathKey: (update, fact) =>
    client
      .post<Fact[]>(`/${enc(update.path)}/${enc(update.key.toString())}`, fact)
      .then((res) => res.data),

  removeById: (id) => client.delete(`/${id}`).then((res) => res.data),

  getPathCounts: () =>
    client.get<PathCountResults>(`/?count=path`).then((res) => res.data),

  findFactsByPathKeys: ({ path, key, limit }) =>
    client
      .get<Fact[]>(`/`, {
        params: {
          path,
          key: toArray(key),
          limit: limit ?? 50,
        },
      })
      .then((res) => res.data),

  findAllFactsByPath: ({ path, limit }) =>
    client
      .get<Fact[]>(`/${encodeURIComponent(path)}`, {
        params: {
          limit: limit ?? 250,
        },
      })
      .then((res) => res.data),
};

export default FactApiClient;
