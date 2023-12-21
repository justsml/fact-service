/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema
    .createTable("fact_store", (table) => {
      table.string("key", 500).primary();
      table.jsonb("fact").notNullable();
      table.timestamps(true, true);
    })
    .then(() => console.log("!!! created table fact_store !!!"))
    .catch((err) => console.error(err));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("fact_store")
    .then(() => console.log("!!! dropped table fact_store !!!"))
    .catch((err) => console.error(err));
};
