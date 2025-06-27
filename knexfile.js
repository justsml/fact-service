import dotenv from "dotenv";
dotenv.config();

const debugMode = process.env.DEBUG_MODE || false;


const { DATABASE_URL, DATABASE_URI } = process.env;
const databaseUrl = DATABASE_URL || DATABASE_URI;

/**
 * @type { import("knex").Knex.Config }
 */
const connectionConfig = {
  client: "pg",
  connection:
    databaseUrl || "postgres://postgres:postgres@localhost:5432/postgres",
  migrations: {
    directory: "./db/migrations",
    tableName: "knex_migrations_facts",
  },
  seeds: { directory: "./db/seeds" },
  debug: toBool(debugMode),
};

export default {
  development: connectionConfig,
  staging: connectionConfig,
  production: connectionConfig,
};

const toBool = (value) => {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
    if (["on", "true", "yes", "1"].includes(value)) return true;
  }
  return false;
}