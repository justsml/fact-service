import axios from "axios";
import { toArray } from "../../common/arrayUtils";
import type { Fact, FactService } from "./types";

const FactsConfig = {
  baseUrl: process.env.FACTS_SERVICE_URL ?? "http://localhost:3000/api/facts",
};

const client = axios.create({ baseURL: FactsConfig.baseUrl });

/**
 * This is the HTTP client for the FactService.
 */
const FactApiClient: FactService = {
  create: (fact) => client.put(`/`, fact),

  update: ({ id, ...fact }) =>
    client.post<Fact[]>(`/${id}`, fact).then((res) => res.data),

  removeById: (id) => client.delete(`/${id}`).then((res) => res.data),

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
