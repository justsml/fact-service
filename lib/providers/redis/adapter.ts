import Redis from "ioredis";
import {
  isFactEntity,
  type FactAdapter,
  type FactEntity,
} from "../../factService/types";
// import { ulid } from "ulidx";
import { NotFoundError } from "../../factService/errors";
import { logger } from "../../../common/logger";

const redis = new Redis(process.env["REDIS_URL"] || "redis://0.0.0.0:6379");

export const adapter: FactAdapter = {
  _name: "redis",

  async set({ key, value, ...rest }) {
    const payload: Omit<FactEntity, "key"> = {
      value,
      // id: value.id ?? ulid(),
      updated_at: new Date().toISOString(),
      created_at:
        "created_at" in rest ? `${rest.created_at}` : new Date().toISOString(),
    };
    await redis.hset(key, payload);
    return { key, ...payload };
  },

  async get({ key }): Promise<FactEntity> {
    const exists = await redis.exists(key);
    if (!exists) throw new NotFoundError(`Fact not found: ${key}`);
    const result = await redis.hgetall(key);
    return isFactEntity(result)
      ? result
      : Promise.reject(Error(`Invalid fact: ${key}`));
  },

  async del({ key }) {
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

  async find({ keyPrefix }) {
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
    logger.debug("Found keys #%d", keys.length);
    logger.info(
      {
        keyPrefix,
        keysFound: keys.length,
      },
      this._name,
    );

    const values: any[] = [];
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const batchValues = await Promise.all(
        batchKeys.map((key) => redis.hgetall(key)),
      );
      values.push(...batchValues);
    }

    return values;
  },
};
