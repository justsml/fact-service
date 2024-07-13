#!/usr/bin/env npx tsx
import dotenv from "dotenv";

dotenv.config();

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

export const AvailableAdapters = [
  "postgres",
  "redis",
  "dynamo",
  "firestore",
  "cassandra",
  // "foundation",
] as const;

export type DbAdapter = typeof AvailableAdapters[number];

export const config = yargs(hideBin(process.argv))
  .option("appEnv", {
    alias: "e",
    type: "string",
    default: process.env["NODE_ENV"] ?? "development",
    description: "Sets the environment in which the app runs",
  })
  .option("port", {
    alias: "p",
    type: "number",
    default: process.env["PORT"] ?? 3000,
    description: "Sets the port on which the app listens",
  })
  .option("allowedTokens", {
    alias: "t",
    type: "array",
    default: process.env["ALLOWED_TOKENS"]?.split(" "),
    description: "Sets the tokens that are allowed to access the app",
  })
  .option("debugMode", {
    alias: "d",
    type: "boolean",
    default: false,
    description: "Enables or disables debug mode",
  })
  .option("dbAdapter", {
    alias: ["a", "adapter"],
    type: "string",
    default: process.env["DB_ADAPTER"] ?? "postgres",
    description: "Sets the database adapter to use",
    choices: AvailableAdapters,
  })
  .option("testAdapters", {
    alias: "A",
    type: "array",
    default: process.env["TEST_ADAPTERS"]?.split(" ") ?? [],
    description: "Sets the adapters to use for testing",
    choices: AvailableAdapters,
  })
  .option("testTargetUrl", {
    alias: "T",
    type: "string",
    default: process.env["TEST_TARGET"] ?? undefined,
    description: "Sets the target URL for testing an HTTP target",
  })
  .option("logLevel", {
    alias: "l",
    type: "string",
    default: process.env["LOG_LEVEL"] ?? "info",
    description: "Sets the level of logging",
  })
  .option("databaseUrl", {
    alias: "db",
    type: "string",
    default: process.env["DATABASE_URL"] ?? "postgres://127.0.0.1:5432",
    description: "Sets the URL for the database",
  })
  .option("redisUrl", {
    alias: "r",
    type: "string",
    default: process.env["REDIS_URL"] ?? "redis://127.0.0.1:6379",
    description: "Sets the URL for the Redis server",
  })
  .option("dynamoDbUrl", {
    alias: "D",
    type: "string",
    default: process.env["DYNAMODB_URL"] ?? "http://127.0.0.1:8000",
    description: "Sets the URL for the DynamoDB server",
  })
  .option("firestoreUrl", {
    alias: "f",
    type: "string",
    default: process.env["FIRESTORE_URL"] ?? "http://127.0.0.1:8080",
    description: "Sets the URL for the Firestore server",
  })
  .option("cassandraUrl", {
    alias: "c",
    type: "string",
    default: process.env["CASSANDRA_URL"] ?? "http://127.0.0.1:9042",
    description: "Sets the URL for the Cassandra server",
  })
  .option("foundationDbUrl", {
    alias: "F",
    type: "string",
    default: process.env["FOUNDATIONDB_URL"] ?? "http://127.0.0.1:4500",
    description: "Sets the URL for the FoundationDB server",
  })
  // .option('pathSeparator', {
  //   alias: 's',
  //   type: 'string',
  //   description: 'Sets the path separator'
  // })
  // .option('pathSplitPattern', {
  //   alias: 'S',
  //   type: 'string',
  //   description: 'Sets the path split pattern'
  // })
  .help()
  .alias("help", "h")
  .version()
  .alias("version", "V")

  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parseSync();


export const appEnv = config.appEnv;
export const allowedTokens = config.allowedTokens;
export const port = config.port;
export const debugMode = config.debugMode;
export const dbAdapter = config.dbAdapter;
export const testAdapters = config.testAdapters;
export const logLevel = config.logLevel;
export const databaseUrl = config.databaseUrl;
export const redisUrl = config.redisUrl;
export const dynamoDbUrl = config.dynamoDbUrl;
export const firestoreUrl = config.firestoreUrl;
export const cassandraUrl = config.cassandraUrl;
export const foundationDbUrl = config.foundationDbUrl;
// export const pathSeparator = config.pathSeparator;
// export const pathSplitPattern = config.pathSplitPattern;
export const verbose = config.verbose;

