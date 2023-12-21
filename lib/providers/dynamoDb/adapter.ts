import {
  DynamoDBClient,
  DeleteTableCommand,
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { logger } from "../../../common/logger";
import { dynamoDbUrl } from "../../config";
import type { Fact, FactAdapter } from "../../factService/types";

const FACT_STORE_TABLE_NAME = process.env.FACT_TABLE_NAME ?? "fact_store";

const dynamoDbClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: dynamoDbUrl,
});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const DynamoAdapter: FactAdapter = {
  set: async (fact) => {
    const { key, fact: payload } = fact;
    const Item = {
      ...payload,
      TIMESTAMP: Date.now(),
      KEY: key,
    };
    logger.debug("DynamoAdapter.set", Item);
    return docClient
      .send(
        new PutCommand({
          TableName: FACT_STORE_TABLE_NAME,
          Item,
          ReturnValues: "ALL_OLD",
        }),
      )
      .then((result) => {
        logger.debug("PutCommand result", result);
        return result.Attributes as Fact
      });
  },

  get: async ({ key }) => {
    return docClient
      .send(
        new QueryCommand({
          TableName: FACT_STORE_TABLE_NAME,
          KeyConditionExpression: "#k = :k",
          ExpressionAttributeValues: { ":k": key },
          ExpressionAttributeNames: { "#k": "KEY" },
        }),
      )
      .then((result) => result.Items?.[0] as Fact);
  },

  del: async ({ key }) => {
    return docClient
      .send(
        new DeleteCommand({
          TableName: FACT_STORE_TABLE_NAME,
          Key: { KEY: key },
        
          ReturnValues: "ALL_OLD",
        }),
      )
      .then((result) => {

        logger.debug("DeleteCommand result", result);
        return {
          success: !!result.Attributes,
          count: 1,
          message: `Deleted any fact with an id equal to ${key}`,
        };
      });
  },

  find: async ({ keyPrefix }) => {
    logger.debug("DynamoAdapter.find", keyPrefix);
    return docClient
      .send(
        new ScanCommand({
          TableName: FACT_STORE_TABLE_NAME,
          FilterExpression: "begins_with(#k, :k)",
          ExpressionAttributeNames: { "#k": "KEY" },
          ExpressionAttributeValues: { ":k": keyPrefix },
        })
        // new QueryCommand({
        //   TableName: FACT_STORE_TABLE_NAME,
        //   // KeyConditionExpression: "begins_with(#k, :k)",
        //   ExpressionAttributeNames: { "#k": "KEY" },
        //   ExpressionAttributeValues: { ":k": keyPrefix },
        //   QueryFilter: {
        //     "KEY": {
        //       ComparisonOperator: "BEGINS_WITH",
        //       AttributeValueList: [keyPrefix],
        //     },
        //   },
        // }),
      )
      .then((result) => result.Items as Fact[]);
  },
};

// const createUpdateParams = (params: { [key: string]: unknown }) => ({
//   UpdateExpression: `set ${Object.entries(params)
//     .map(([key]) => `#${key} = :${key}, `)
//     .reduce((acc, str) => acc + str, "")
//     .slice(0, -2)}`,

//   ExpressionAttributeValues: Object.entries(params).reduce(
//     (acc, [key, value]) => ({
//       ...acc,
//       [`:${key}`]: value,
//     }),
//     {},
//   ),

//   ExpressionAttributeNames: Object.keys(params).reduce(
//     (acc, key) => ({
//       ...acc,
//       [`#${key}`]: key,
//     }),
//     {},
//   ),
// });

/**
 * Temp helper to create a table in DynamoDB */
export const createTable = async () => {
  return await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: FACT_STORE_TABLE_NAME,

      AttributeDefinitions: [
        {
          AttributeName: "KEY",
          AttributeType: "S",
        },
        // {
        //   AttributeName: "TIMESTAMP",
        //   AttributeType: "N",
        // },
      ],
      KeySchema: [
        {
          AttributeName: "KEY",
          KeyType: "HASH",
        },
        // {
        //   AttributeName: "TIMESTAMP",
        //   KeyType: "RANGE",
        // },
      ],

      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      // StreamSpecification: {
      //   StreamEnabled: false,
      // },
    }),
  );
};

export const dropTable = async () => {
  return await dynamoDbClient.send(
    new DeleteTableCommand({
      TableName: FACT_STORE_TABLE_NAME,
    }),
  );
};
