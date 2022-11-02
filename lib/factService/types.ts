import type { IQueryParameters } from "../../common/routeUtils";

/** Fact type describes records in the `fact_store` table. */
export interface Fact {
  id: number | bigint | string;
  path: string;
  key: string;
  value: object;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * The FactService interface helps our http & database clients stay aligned.
 */
export interface FactService {
  /** Create a Fact, include `path`, `key`, and `value` */
  create: (fact: Omit<Fact, "id">) => Promise<Fact[]>;
  /** Update a Fact, include `id`, `path`, `key`, and `value` */
  update: (fact: Fact) => Promise<Fact[]>;
  /** Delete a Fact by id */
  removeById: (id: number | bigint) => Promise<{ message: string }>;
  /** Group & count unique paths */
  getUniquePathCounts: () => Promise<{ path: string; count: number | string }[]>;
  /** Find all facts matching a path and one or more keys. */
  findFactsByPathKeys: (
    query: IFactServiceQuery & IQueryParameters,
  ) => Promise<Fact[]>;
  /** Find all facts by path */
  findAllFactsByPath: (
    query: { path: string } & IQueryParameters,
  ) => Promise<Fact[]>;
}

export interface IFactServiceQuery {
  path: string;
  key: string | string[];
}
