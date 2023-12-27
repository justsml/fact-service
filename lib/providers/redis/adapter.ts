import Redis from "ioredis";
import type { FactAdapter } from "../../factService/types";
import { ulid } from "ulidx";
import { NotFoundError } from "../../factService/errors";

const redis = new Redis(process.env.REDIS_URL || "redis://0.0.0.0:6379");

export const adapter: FactAdapter = {
  _name: "redis",

  set: async ({ key, fact }) => {
    const payload = { ...fact, id: fact.id ?? ulid() };
    await redis.hset(key, payload);
    return [payload];
  },

  get: async ({ key }) => {
    const exists = await redis.exists(key);
    if (!exists) throw new NotFoundError(`Fact not found: ${key}`)
    return await redis.hgetall(key);
  },

  del: async ({ key }) => {
    const keyList = Array.isArray(key) ? key : [key];
    const deleted = await Promise.allSettled(
      keyList.map((key) => redis.hdel(key)),
    );
    return {
      success: deleted.length > 0,
      message:
        deleted.length > 0
          ? `Deleted fact(s): ${keyList.join(", ")}`
          : "Fact not found",
      count: deleted.length,
    };
  },

  find: async ({ keyPrefix }) => {
    let cursor = "0";
    const keys: string[] = [];

    do {
      const [nextCursor, scanKeys] = await redis.scan(
        cursor,
        "MATCH",
        `${keyPrefix}*`,
      );
      keys.push(...scanKeys);
      cursor = nextCursor;
    } while (cursor !== "0");

    return keys;
  },
};
