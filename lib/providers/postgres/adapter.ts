import {
  isFactEntity,
  type FactAdapter,
  type FactEntity,
} from "../../factService/types";
import knex from "../../../db/knex";
import { checkPostgresError } from "../../../common/routeUtils";
import { logger } from "../../../common/logger";
import { toArray } from "../../../common/arrayUtils";
import { NotFoundError } from "elysia";

export const adapter: FactAdapter = {
  _name: "postgres",

  async set({ key, value, ...rest }) {
    // async set(fact) {
    return await knex<FactEntity>("fact_store")
      .insert({ ...rest, key, value, updated_at: new Date() })
      .onConflict("key")
      .merge()
      .returning("*")
      .then((result) => {
        return result && result.length === 1 ? result[0] : result;
      })
      .catch((error) => {
        logger.error("ERROR %o", error);
        return checkPostgresError({ fact: { key, value } })(error);
      });
  },
  async get({ key }): Promise<FactEntity> {
    // async get({ key }) {
    return await knex<FactEntity>("fact_store")
      .select("*")
      .where({ key })
      .first()
      .catch(checkPostgresError({ key }))
      .then((result) => {
        if (!result)
          throw Object.assign(new NotFoundError(`Fact not found: ${key}`), {
            status: 404,
          });
        if (isFactEntity(result)) return result;
        logger.warn("Fact Schema Invalid: %o", result);
        throw Error(`Fact Schema Invalid: ${key}`);
        // return undefined;
      });
  },

  async del({ key }) {
    return Promise.all([
      toArray(key).map((key) =>
        knex<FactEntity>("fact_store").where({ key }).delete(),
      ),
    ]).then((results) => {
      return {
        success: results.length > 0,
        count: results.length,
        message: `Deleted ${results.length} fact(s):`,
      };
    });
  },

  async find({ keyPrefix }) {
    return await knex<FactEntity>("fact_store")
      .select("*")
      .limit(1_000)
      .whereILike("key", knex.raw(`concat(?::text, '%')`, keyPrefix))
      .then((rows) => (rows.every(isFactEntity) ? rows : []));
  },
};

export const setup = async () => {
  return knex.schema
    .createTable("fact_store", (table) => {
      table.string("key", 500).primary();
      table.jsonb("value").notNullable();

      table.timestamps(true, true);
    })
    .then(() => console.log("!!! created table fact_store !!!"))
    .catch((err) =>
      err.message.includes("already exists")
        ? "Already exists"
        : console.error(err),
    );
};

export const reset = async () => {
  return knex.schema
    .dropTableIfExists("fact_store")
    .then(() => console.log("!!! dropped table fact_store !!!"))
    .catch((err) => console.error(err));
};
