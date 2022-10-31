/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  if (await knex.schema.hasTable("fact_store")) return;

  return knex.schema.createTable("fact_store", (table) => {
    table.bigIncrements("id").primary();
    table.string("path", 256).notNullable();
    table.string("key", 64).notNullable();
    table.jsonb("value");
    table.timestamps(true, true);
    table.unique(["path", "key"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("fact_store");
};
