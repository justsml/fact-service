import "dotenv/config";

import { autoConfig } from "@elite-libs/auto-config";
import { randomUUID } from "crypto";
// import { escapeRegExp } from "lodash";
export const config = autoConfig({
  env: {
    type: "string",
    default: "development",
    args: ["FACTS_ENV", "NODE_ENV"],
    help: "Sets the environment in which the app runs",
  },
  port: {
    type: "number",
    default: 3000,
    args: ["--port", "-p", "PORT"],
    help: "Sets the port on which the app listens",
  },
  allowedTokens: {
    type: "array",
    default: [randomUUID()],
    min: 1,
    required: true,
    args: ["--allowedTokens", "ALLOWED_TOKENS"],
    help: "Sets the tokens that are allowed to access the app",
    transform: (t) =>
      _parseTokenList(Array.isArray(t) ? t : t != null ? `${t}` : ""),
  },
  debugMode: {
    type: "boolean",
    default: false,
    args: ["--debug", "DEBUG_MODE"],
    help: "Enables or disables debug mode",
  },
  verbose: {
    type: "boolean",
    default: false,
    args: ["--verbose", "VERBOSE"],
    help: "Enables or disables verbose logging",
  },
  dbAdapter: {
    type: "enum",
    enum: [
      "postgres",
      "redis",
      "dynamo",
      "firestore",
      "cassandra",
      "foundation",
    ],
    default: "postgres",
    args: ["--dbAdapter", "DB_ADAPTER"],
    help: "Sets the database adapter to use",
  },
  logLevel: {
    type: "enum",
    enum: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "info",
    args: ["--logLevel", "LOG_LEVEL"],
    help: "Sets the level of logging",
  },
  testAdapters: {
    type: "array",
    default: ["postgres", "redis", "dynamo", "cassandra", "firestore"],
    args: ["--testAdapters", "TEST_ADAPTERS"],
    help: "Sets the adapters to use for testing",
  },
  databaseUrl: {
    type: "string",
    args: ["--db", "DATABASE_URL", "DATABASE_URI"],
    help: "Sets the URL for the database",
  },
  redisUrl: {
    type: "string",
    args: ["--redis", "REDIS_URL", "REDIS_URI"],
    help: "Sets the URL for the Redis server",
  },
  dynamoDbUrl: {
    type: "string",
    args: ["--dynamoDb", "DYNAMODB_URL", "DYNAMO_URL"],
    help: "Sets the URL for the DynamoDB server",
  },
  firestoreUrl: {
    type: "string",
    args: ["--firestore", "FIRESTORE_URL", "FIRESTORE_URI"],
    help: "Sets the URL for the Firestore server",
  },
  cassandraUrl: {
    type: "string",
    args: ["--cassandra", "CASSANDRA_URL", "CASSANDRA_URI"],
    help: "Sets the URL for the Cassandra server",
  },
  foundationDbUrl: {
    type: "string",
    args: ["--foundationDb", "FOUNDATION_DB_URL", "FOUNDATION_URL"],
    help: "Sets the URL for the FoundationDB server",
  },
});
// const config = easyConfig({
//   env: ["FACTS_ENV", "NODE_ENV"],
//   port: ["--port", "-p", "PORT"],
//   allowedTokens: ["--allowedTokens", "ALLOWED_TOKENS"],

//   debugMode: ["--debug", "DEBUG_MODE"],
//   verbose: ["--verbose", "VERBOSE"],
//   // Dynamic DB_ADAPTER var controls which DB adapter is used
//   dbAdapter: ["--dbAdapter", "DB_ADAPTER"],

//   logLevel: ["--logLevel", "LOG_LEVEL"],

//   testAdapters: ["--testAdapters", "TEST_ADAPTERS"],

//   // DB Connection Strings
//   databaseUrl: ["--db", "DATABASE_URL", "DATABASE_URI"],
//   redisUrl: ["--redis", "REDIS_URL", "REDIS_URI"],
//   dynamoDbUrl: ["--dynamoDb", "DYNAMODB_URL", "DYNAMO_URL"],
//   firestoreUrl: ["--firestore", "FIRESTORE_URL", "FIRESTORE_URI"],
//   cassandraUrl: ["--cassandra", "CASSANDRA_URL", "CASSANDRA_URI"],
//   foundationDbUrl: ["--foundationDb", "FOUNDATION_DB_URL", "FOUNDATION_URL"],
//   // pathSeparator: ["--pathSeparator", "PATH_SEPARATOR"],
//   // pathSplitPattern: ["--pathSplitPattern", "PATH_SPLIT_PATTERN"],
// });

export { config as siteConfig };

// export default config;

export const allowedTokens = _parseTokenList(config.allowedTokens);
// override the config.allowedTokens?
// config.allowedTokens = allowedTokens;

export const appEnv = config.env ?? "development";

export const testAdapters = config.testAdapters as unknown as Array<'postgres' | 'redis' | 'dynamo' | 'firestore' | 'cassandra' | 'foundation'>;

export const logLevel =
  config.logLevel === "fatal"
    ? "fatal"
    : config.logLevel === "error"
      ? "error"
      : config.logLevel === "warn"
        ? "warn"
        : config.logLevel === "info"
          ? "info"
          : config.logLevel === "debug"
            ? "debug"
            : config.logLevel === "trace"
              ? "trace"
              : "info";

export const debugMode = config.debugMode;
export const verbose = Boolean(config.verbose);
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
    ? supportedDbAdapters.find(
        (adapter) => config.dbAdapter?.startsWith(adapter),
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
