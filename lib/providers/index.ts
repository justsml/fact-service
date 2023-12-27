import * as postgres from "./postgres/adapter";
import * as dynamo from "./dynamoDb/adapter";
import * as redis from "./redis/adapter";
import * as cassandra from "./cassandra/adapter";
import * as firestore from "./firestore/adapter";
// import * as foundation from "./foundation/adapter";

import { dbAdapter } from "../config";

export const getDataAdapter = (adapterName: string = dbAdapter) => {
  switch (adapterName) {
    case "postgres":
      return postgres.adapter;
    case "redis":
      return redis.adapter;
    case "dynamo":
      return dynamo.adapter;
    case "cassandra":
      return cassandra.adapter;
    case "firestore":
      return firestore.adapter;
    case "foundation":
      throw new Error(`foundation adapter not yet implemented`);
    default:
      throw new Error(`Invalid dbAdapter: ${adapterName}`);
  }
};

// export const getDataAdapter = (adapterName: string = dbAdapter) => {
//   switch (adapterName) {
//     case "postgres":
//       return PostgresAdapter
//     case "redis":
//       return RedisAdapter
//     case "dynamo":
//       return DynamoAdapter
//     case "firestore":
//       throw new Error(`firestore adapter not yet implemented`)
//     case "cassandra":
//       throw new Error(`cassandra adapter not yet implemented`)
//     case "foundation":
//       throw new Error(`foundation adapter not yet implemented`)
//     default:
//       throw new Error(`Invalid dbAdapter: ${adapterName}`);
//   }
// }
