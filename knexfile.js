require("dotenv").config();

const { DATABASE_URL, DATABASE_URI } = process.env;
const databaseUrl = DATABASE_URL || DATABASE_URI;

/**
 * @type { import("knex").Knex.Config }
 */
const config = {
  client: "pg",
  connection:
    databaseUrl || "postgres://postgres:postgres@localhost:5432/postgres",
  migrations: { directory: "./db/migrations", tableName: "knex_migrations_facts" },
  seeds: { directory: "./db/seeds" },
  // debug: true,
};

module.exports = {
  development: config,
  staging: config,
  production: config,
};
