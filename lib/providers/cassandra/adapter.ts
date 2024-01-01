import type { Fact, FactAdapter } from "../../factService/types";
import cassandra, { Client } from "cassandra-driver";
import { logger } from "../../../common/logger";
import { cassandraUrl } from "../../config";
import { NotFoundError, UserError } from "../../factService/errors";

const KEY_SPACE = "fact_space";
const TABLE_NAME = "fact_store";

const requestTracker = new cassandra.tracker.RequestLogger({
  logNormalRequests: true,
  logErroredRequests: true,
  messageMaxErrorStackTraceLength: 50,
  slowThreshold: 100,
});

const convertKeyToListLiteral = (key: string) =>
 `${key
  .split(/[/:]+/gim)
  .map((k) => `'${k.replace(/'+/gim, "")}'`)
  .join(", ")}`;

  const convertKeyToContainsExpression = (key: string) =>
  `${key
   .split(/[/:]+/gim)
   .map((k) => `key_parts CONTAINS '${k.replace(/'+/gim, "")}'`)
   .join(" AND ")}`;
 
 const client = new Client({
  contactPoints: [cassandraUrl ?? "localhost"],
  localDataCenter: "datacenter1",
  // keyspace: KEY_SPACE,
  requestTracker,
});

client.on("log", (level, className, message, furtherInfo) => {
  logger.debug("CASSANDRA.log %o", {
    level,
    className,
    message,
    furtherInfo,
  });
});

client.on("error", (error) => {
  logger.error("CASSANDRA.error %o", error);
});

export const adapter: FactAdapter = {
  _name: "cassandra",

  set: async ({ key, fact }) => {
    const query = `INSERT INTO ${KEY_SPACE}.${TABLE_NAME} \
      (
        key,
        key_parts,
        value,
        created_at,
        updated_at
      ) VALUES (?, {${convertKeyToListLiteral(key)}}, ?, ?, ?) USING TIMESTAMP ?`;
    fact = Object.fromEntries(
      Object.entries(fact).map(([k, v]) => [k, `${v}`]),
    );

    const params = [key, fact, Date.now(), Date.now(), Date.now()];
    try {
      await client.execute(query, params, { prepare: true }).catch(autoSetup);
      logger.info("CASSANDRA.set(%o)", { key, fact });
      const saved = await adapter.get({ key });
      logger.info("CASSANDRA.getting(%s) %o", key, saved);
      return saved!;
    } catch (error) {
      logger.error(error);
      throw error; // Or handle the error as needed
    }
  },

  get: async ({ key }) => {
    const query = `SELECT * FROM ${KEY_SPACE}.${TABLE_NAME} WHERE key = ?`;
    try {
      const result = await client
        .execute(query, [key], { prepare: true })
        .catch(autoSetup);
      console.log("result:", result);
      if (result.rowLength <= 0)
        throw new NotFoundError(`Key not found: ${key}`);
      return result.rows[0]; // Adjust as needed
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },

  del: async ({ key }) => {
    const query = `DELETE FROM ${KEY_SPACE}.${TABLE_NAME} WHERE key = ?`;
    try {
      const result = await client
        .execute(query, [key], { prepare: true })
        .catch(autoSetup);
      return {
        success: result.rowLength > 0,
        count: result.rowLength,
        message: `Deleted any fact with an id equal to ${key}`,
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },

  find: async ({ keyPrefix }) => {
    // Note: Cassandra does not support ILIKE, so this is a basic implementation
    const query = `SELECT * FROM ${KEY_SPACE}.${TABLE_NAME} WHERE ${convertKeyToContainsExpression(
      keyPrefix,
    )};`;
    try {
      const result = await client.execute(query, [], {
        prepare: true,
      });
      // .catch(autoSetup);
      return result.rows as Fact[]; // Adjust as needed
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
};

export const setup = async () => {
  await client.execute(`CREATE KEYSPACE IF NOT EXISTS ${KEY_SPACE}
    WITH REPLICATION = {
      'class' : 'SimpleStrategy',
      'replication_factor' : 1
    };`);

  await client.execute(
    `CREATE TABLE IF NOT EXISTS ${KEY_SPACE}.${TABLE_NAME} (
    key text PRIMARY KEY,
    key_parts set<text>,
    value map<text, text>,
    created_at timestamp,
    updated_at timestamp
  );`,
  );

  // await client.execute(`CREATE INDEX IF NOT EXISTS key_idx
  //   ON ${KEY_SPACE}.${TABLE_NAME} (key);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS key_parts_idx
    ON ${KEY_SPACE}.${TABLE_NAME} (key_parts);`);

  // await client.execute(`CREATE CUSTOM INDEX IF NOT EXISTS
  //   ON ${KEY_SPACE}.${TABLE_NAME} (key,) USING 'org.apache.cassandra.index.sasi.SASIIndex'
  //   WITH OPTIONS = {'mode': 'PREFIX'};`);
};

export const reset = async () => {
  await client
    .execute(
      `
    DROP TABLE ${KEY_SPACE}.${TABLE_NAME};
  `,
    )
    .catch((error) => {
      console.warn(
        `Cassandra Table already dropped: ${KEY_SPACE}.${TABLE_NAME}`,
        error,
      );
    });

  await client.execute(`
    DROP KEYSPACE ${KEY_SPACE};
  `);
};

function autoSetup<TError extends Error>(error: TError) {
  if ("code" in error && error?.code === 8704) {
    logger.error("CASSANDRA.autoSetup %o", error);
    logger.error(error);
    return setup()
      .catch((error) => logger.error(error))
      .then(() =>
        Promise.reject(new UserError(`Table not found! Retry your request.`)),
      );
  }
  throw error;
}
