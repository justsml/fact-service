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
export type PathCountResults = Record<string, number>;
export type IdentityType = Fact['id']; // number | bigint | string;
export type BatchResultMessage = {
  success: boolean;
  message: string;
  count: number;
};

/**
 * The FactService interface helps our http & database clients stay aligned.
 */
export interface FactService {
  /** Create a Fact, include `path`, `key`, and `value` */
  create: (fact: Omit<Fact, 'id'>) => Promise<Fact[]>;
  /** Update a Fact, include `id`, `path`, `key`, and `value` */
  updateById: (fact: Fact) => Promise<Fact[]>;
  /** Update a Fact, include `id`, `path`, `key`, and `value` */
  updateByPathKey: (updatePathKey: IFactPathKey, fact: Omit<Fact, 'id'>) => Promise<Fact[]>;
  /** Delete a Fact by id */
  removeById: (id: IdentityType) => Promise<BatchResultMessage>;
  /** Group & count unique paths */
  getPathCounts: () => Promise<PathCountResults>;
  /** Find all facts matching a path and one or more keys. */
  findFactsByPathKeys: (
    query: IFactServiceQuery & IQueryParameters,
  ) => Promise<Fact[]>;
  /** Find all facts by path */
  findAllFactsByPath: (
    query: { path: string } & IQueryParameters,
  ) => Promise<Fact[]>;
}

/** For querying many keys for a path */
export interface IFactServiceQuery {
  path: string;
  key: IdentityType | IdentityType[];
}

/** Singular path + key lookup */
export interface IFactPathKey {
  path: string;
  key: IdentityType;
}
