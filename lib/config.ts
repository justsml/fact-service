import "dotenv/config";

import { easyConfig } from "@elite-libs/auto-config";
// import { escapeRegExp } from "lodash";

const config = easyConfig({
  env: ["FACTS_ENV", "NODE_ENV"],
  port: ["--port", "-p", "PORT"],
  allowedTokens: ["--allowedTokens", "ALLOWED_TOKENS"],

  // Dynamic DB_ADAPTER var controls which DB adapter is used
  dbAdapter: ["--dbAdapter", "DB_ADAPTER"],

  // DB Connection Strings
  databaseUrl: ["--db", "DATABASE_URL", "DATABASE_URI"],
  redisUrl: ["--redis", "REDIS_URL", "REDIS_URI"],
  dynamoDbUrl: ["--dynamoDb", "DYNAMODB_URL", "DYNAMO_URL"],
  firestoreUrl: ["--firestore", "FIRESTORE_URL", "FIRESTORE_URI"],
  cassandraUrl: ["--cassandra", "CASSANDRA_URL", "CASSANDRA_URI"],
  foundationDbUrl: ["--foundationDb", "FOUNDATION_DB_URL", "FOUNDATION_URL"],
  // pathSeparator: ["--pathSeparator", "PATH_SEPARATOR"],
  // pathSplitPattern: ["--pathSplitPattern", "PATH_SPLIT_PATTERN"],
});

// export default config;

export const allowedTokens = _parseTokenList(config.allowedTokens);
// override the config.allowedTokens?
// config.allowedTokens = allowedTokens;

export const env = config.env;
export const port = Number(config.port);
export const databaseUrl = config.databaseUrl;
export const redisUrl = config.redisUrl;
export const dynamoDbUrl = config.dynamoDbUrl;
export const firestoreUrl = config.firestoreUrl;
export const cassandraUrl = config.cassandraUrl;
export const foundationDbUrl = config.foundationDbUrl;

export type DbAdapter =
  | "postgres"
  | "redis"
  | "dynamo"
  | "firestore"
  | "cassandra"
  | "foundation";
export const supportedDbAdapters: Readonly<DbAdapter[]> = [
  "postgres",
  "redis",
  "dynamo",
  "firestore",
  "cassandra",
  "foundation",
] as const;

export const dbAdapter: DbAdapter =
  config.dbAdapter != null
    ? supportedDbAdapters.find((adapter) =>
        config.dbAdapter.startsWith(adapter),
      ) ?? "postgres"
    : "postgres";

if (allowedTokens.length <= 0)
  throw new Error(`ALLOWED_TOKENS is empty. Check config or .env file.`);

/**
 * Splits tokens set in env.ALLOWED_TOKENS (space delimited)
 */
function _parseTokenList(tokenList: string | string[] | undefined): string[] {
  if (tokenList == null) return [];
  if (Array.isArray(tokenList)) return tokenList;
  return tokenList.split(/\s+/);
}
