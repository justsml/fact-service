import type { IQueryParameters } from "../../common/routeUtils";

export interface IFactServiceQuery {
  path: string;
  key: string | string[];
}

export interface IFact {
  id: number | bigint | string;
  path: string;
  key: string;
  value: object;
  created_at?: Date;
  updated_at?: Date;
}

export interface IFactClient {
  findById: (id: number | bigint) => Promise<IFact>;
  findFactsByPathKeys: (query: IFactServiceQuery & IQueryParameters) => Promise<IFact[]>;
  findAllFactsByPath: (query: { path: string } & IQueryParameters) => Promise<IFact[]>;
  create: (data: Omit<IFact, "id">) => Promise<IFact[]>;
  update: (data: IFact) => Promise<IFact[]>;
  removeById: (id: number | bigint) => Promise<{ message: string }>;
}
