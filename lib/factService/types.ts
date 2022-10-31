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
 * The FactService interface helps our client and server stay aligned.
 */
export interface FactClient {
  findById: (id: number | bigint) => Promise<Fact>;
  /**
   * 
   */
  findFactsByPathKeys: (
    query: IFactServiceQuery & IQueryParameters,
  ) => Promise<Fact[]>;
  findAllFactsByPath: (
    query: { path: string } & IQueryParameters,
  ) => Promise<Fact[]>;
  create: (data: Omit<Fact, "id">) => Promise<Fact[]>;
  update: (data: Fact) => Promise<Fact[]>;
  removeById: (id: number | bigint) => Promise<{ message: string }>;
}

export interface IFactServiceQuery {
  path: string;
  key: string | string[];
}
