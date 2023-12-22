import { PostgresAdapter } from "./postgres/adapter";
import { DynamoAdapter, setupDynamo } from "./dynamoDb/adapter";
import { RedisAdapter } from "./redis/adapter";

import { dbAdapter } from "../config";

export const getDataAdapter = (adapterName: string = dbAdapter) => {
  switch (adapterName) {
    case "postgres":
      return PostgresAdapter
    case "redis":
      return RedisAdapter
    case "dynamo":
      return DynamoAdapter
    case "firestore":
      throw new Error(`firestore adapter not yet implemented`)
    case "cassandra":
      throw new Error(`cassandra adapter not yet implemented`)
    case "foundation":
      throw new Error(`foundation adapter not yet implemented`)
    default:
      throw new Error(`Invalid dbAdapter: ${adapterName}`);
  }
}

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