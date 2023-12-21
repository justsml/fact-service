import Redis from "ioredis";
import type {
  FactAdapter,
  Fact,
  PathCountResults,
  IdentityType,
  BatchResultMessage,
  IFactPathKey,
} from "../factService/types";
import { ulid } from "ulidx";

const redis = new Redis(process.env.REDIS_URL || 'redis://0.0.0.0:6379');

const FactDatabaseClient: Partial<FactAdapter> = {
  create: async (fact: Omit<Fact, "id">) => {
    const key = getPathKey(fact);
    const payload = { ...fact, id: ulid() };
    await redis.hset(key, payload);
    return [payload];
  },

  updateById: async (fact: Fact) => {
    const key = `fact:${fact.id}`;
    await redis.set(key, JSON.stringify(fact));
    return [fact];
  },

  // @ts-expect-error TODO: fix this
  updateByPathKey: async (updatePathKey, fact) => {
    const key = getPathKey(updatePathKey);
    await redis.hset(key, fact);
    return [fact];
  },

  removeByPathKey: async (pathKey: IFactPathKey) => {
    const key = getPathKey(pathKey);
    const deleted = await redis.hdel(key);
    return {
      success: deleted > 0,
      message: deleted > 0 ? `Deleted fact with id: ${id}` : "Fact not found",
      count: deleted,
    };
  },

  // getPathCounts: async () => {
  //   // Implement logic to count paths
  //   // This might involve scanning keys and counting occurrences
  //   // Redis doesn't directly support this operation, so it might be inefficient
  // },

  // findFactsByPathKeys: async (query) => {
  //   // Implement logic to find facts by path and keys
  //   // This would require scanning or a secondary indexing mechanism
  //   // Redis isn't ideally suited for this kind of query
  // },

  // findAllFactsByPath: async (query) => {
  //   // Implement logic to find all facts by path
  //   // Similar to findFactsByPathKeys, this is complex in Redis
  // },
};

function getPathKey({ path, key }: { path: string; key: IdentityType }) {
  return `${path}:${key}`;
}

export default FactDatabaseClient;
