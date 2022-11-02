# Postgres Development Guide

We'll be using Knex.js, a popular query builder, with support for Rails-like migrations and seeding.

## Migrations

> **Note:** Knex will write to a `knex_migrations` table in the database. This table will be created automatically when you run your first migration.

### Creating a Migration

To create a migration script, run:

```sh
npx knex migrate:make retail_locations
```

### Running Migrations

To run new migrations, run:

```sh
npx knex migrate:latest
```

### Rolling Back Migrations

To roll back the last migration, run:

```sh
npx knex migrate:rollback
```

## Seeding

### Creating a Seed

To create a seed script, run:

```sh
npx knex seed:make 01_retail_locations
```

Update the default script to use `.truncate()` instead of `.del()`, for example:

```js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries and resets id sequences
  await knex('table_name').truncate();

  await knex('table_name').insert([
    {id: 1, colName: 'rowValue1'},
    {id: 2, colName: 'rowValue2'},
    {id: 3, colName: 'rowValue3'},
  ]);
  // For visualizing the data added to the database:
  // .returning('*')
  // .then((rows) => {
  //   console.log('inserted ', rows);
  // });
};
```

### Running Seeds

To run all seed files in order, run:

```sh
npx knex seed:run
```
