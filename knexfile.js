require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const postgresConfig = {
  client: 'pg',
  connection:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  migrations: { directory: './db/migrations' },
  seeds: { directory: './db/seeds' },
};

module.exports = {
  development: postgresConfig,

  staging: postgresConfig,

  production: postgresConfig,
};
