import knex from "knex";
import knexfile from "../knexfile";

let env: keyof typeof knexfile = "development";
if (process.env.NODE_ENV === "production") env = "production";
if (process.env.NODE_ENV === "staging") env = "staging";

if (!knexfile[env]) {
  throw new Error(`Knexfile for ${env} environment not found`);
}

export default knex(knexfile[env]);
