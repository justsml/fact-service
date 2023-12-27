import axios from "axios";
// import { toArray } from "../../common/arrayUtils";
import type { Fact, FactAdapter } from "./types";

const FactsConfig = {
  apiUrl: process.env.API_URL ?? "http://localhost:3000/api/facts",
  apiToken: process.env.API_TOKEN ?? null,
};

const client = axios.create({
  baseURL: FactsConfig.apiUrl,
  headers: {
    Authorization: `Bearer ${FactsConfig.apiToken}`,
  },
});

const enc = encodeURIComponent;

/**
 * This is the HTTP client for the FactService.
 */
const FactApiClient: FactAdapter = {
  _name: "http",
  
  set: (fact) => client.put(`/`, fact).then((res) => res.data),

  get: ({ key }) =>
    client.get<Fact>(`/${encodeURIComponent(key)}`).then((res) => res.data),

  // updateByPathKey: (update, fact) =>
  //   client
  //     .post<Fact[]>(`/${enc(update.path)}/${enc(update.key.toString())}`, fact)
  //     .then((res) => res.data),

  del: ({ key }) => client.delete(`/${key}`).then((res) => res.data),

  // getPathCounts: () =>
  //   client.get<PathCountResults>(`/?count=path`).then((res) => res.data),

  find: ({ keyPrefix }) =>
    client.get<Fact[]>(`/?keyPrefix=${enc(keyPrefix)}`).then((res) => res.data),

  // findAllFactsByPath: ({ path, limit }) =>
  //   client
  //     .get<Fact[]>(`/${encodeURIComponent(path)}`, {
  //       params: {
  //         limit: limit ?? 250,
  //       },
  //     })
  //     .then((res) => res.data),
};

export default FactApiClient;
