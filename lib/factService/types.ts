import type { DbAdapter } from "../config";

/** FactEntity is the raw database record */
export type FactEntity = {
  key: string;
  value: string;

  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
};

/** Fact is the API response */
export interface Fact {
  [key: string]: unknown;
  created_at?: Date;
  updated_at?: Date;
}

/** KeyFact describes the input for update/set */
export type KeyFact = {
  key: string;
  fact: Fact;
};

// /** PathCountResults is the response from getPathCounts (`/api/stats`) */
// export type PathCountResults = Record<string, number>;
export type BatchResultMessage = {
  success: boolean;
  message: string;
  count: number;
};

/**
 * The FactService interface helps our http & database clients stay aligned.
 */
export interface FactAdapter {
  readonly _name: DbAdapter | "http";
  /** Get a Fact, by key */
  get: ({ key }: { key: string }) => Promise<Fact | undefined>;
  /** Create/update a Fact, key & payload */
  set: ({ key, fact }: KeyFact) => Promise<Fact | Fact[]>;
  /** Delete a Fact by id */
  del: ({ key }: { key: string | string[] }) => Promise<BatchResultMessage>;
  /** Find all facts matching a path and one or more keys. */
  find: ({ keyPrefix }: { keyPrefix: string }) => Promise<string[] | Fact[]>;
  /** Find all facts by path */
  // findAllFactsByPath: (
  //   query: { path: string } & IQueryParameters,
  // ) => Promise<Fact[]>;
  // /** Group & count unique paths */
  // getPathCounts: () => Promise<PathCountResults>;
}
