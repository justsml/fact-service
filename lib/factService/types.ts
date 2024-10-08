import { t } from "elysia";
import type { DbAdapter } from "../config";

/**
 * FactEntity is the raw database record
 */
export type FactEntity  = (typeof FactResponseTypeDef)["static"];

/** Type guard for FactEntity */
export const isFactEntity = (obj: unknown): obj is FactEntity => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const { key, value } = obj as FactEntity;
  return (
    typeof key === "string" &&
    (typeof value === "object" ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      Array.isArray(value))
  );
};

export const FactResponseTypeDef = t.Object({
  key: t.String(),
  value: t.Union([
    t.Object({}, { additionalProperties: true }),
    t.Array(t.Any()),
    t.String(),
    t.Number(),
    t.Boolean(),
  ]),
  created_by: t.Optional(t.String()),
  updated_by: t.Optional(t.String()),
  created_at: t.Optional(t.Union([t.Date({}), t.String(), t.Number()])),
  updated_at: t.Optional(t.Union([t.Date({}), t.String(), t.Number()])),
});

/** Fact is the API response */
export interface Fact {
  [key: string]: unknown;
  created_at?: Date | string | number;
  updated_at?: Date | string | number;
}

/** KeyFact describes the input for update/set */
export type KeyFact = Pick<FactEntity, "key" | "value">;

// /** PathCountResults is the response from getPathCounts (`/api/stats`) */
// export type PathCountResults = Record<string, number>;
export type BatchResultMessage = {
  success: boolean;
  message: string;
  count: number;
};
export const BatchResultTypeDef = t.Object({
  success: t.Boolean(),
  message: t.String(),
  count: t.Number(),
});

/**
 * The FactService interface helps our http & database clients stay aligned.
 */
export interface FactAdapter {
  readonly _name: DbAdapter | "http";
  /** Get a Fact, by key */
  get: ({ key }: { key: string }) => Promise<FactEntity | undefined>;
  /** Create/update a Fact, key & payload */
  set: ({ key, value }: KeyFact) => Promise<FactEntity | FactEntity[]>;
  /** Delete a Fact by id */
  del: ({ key }: { key: string }) => Promise<BatchResultMessage>;
  /** Find all facts matching a path and one or more keys. */
  find: ({ keyPrefix }: { keyPrefix: string }) => Promise<FactEntity[]>;
  /** Find all facts by path */
  // findAllFactsByPath: (
  //   query: { path: string } & IQueryParameters,
  // ) => Promise<Fact[]>;
  // /** Group & count unique paths */
  // getPathCounts: () => Promise<PathCountResults>;
}
