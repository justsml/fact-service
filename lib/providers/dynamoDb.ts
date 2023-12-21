import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDbUrl } from "../config";
import type { Fact, FactAdapter } from "../factService/types";

const FACT_STORE_TABLE_NAME = process.env.FACT_TABLE_NAME ?? "fact_store";

const dynamoDbClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: dynamoDbUrl,
});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

const FactDatabaseClient: FactAdapter = {
  set: async (fact) => {
    const { key, ...payload } = fact;
    return docClient.send(new PutCommand({
      TableName: FACT_STORE_TABLE_NAME,
      Item: payload,
      ReturnValues: "ALL_NEW"
    })).then((result) => result.Attributes as Fact)
  },
  
  get: async ({ key }) => {
    return docClient
      .send(
        new QueryCommand({
          TableName: FACT_STORE_TABLE_NAME,
          KeyConditionExpression: "key = :k",
          ExpressionAttributeValues: { ":k": key },
        }),
      )
      .then((result) => result.Items?.[0] as Fact);
  },

  del: async ({ key }) => {
    return docClient
      .send(
        new DeleteCommand({
          TableName: FACT_STORE_TABLE_NAME,
          Key: { key },
          ReturnValues: "ALL_OLD",
        }),
      )
      .then((result) => {
        console.log("DeleteCommand result", result);
        return {
          success: !!result.Attributes,
          count: 1,
          message: `Deleted any fact with an id equal to ${key}`,
        }
      });
  },

  find: async ({ keyPrefix }) => {
    return docClient
      .send(
        new QueryCommand({
          TableName: FACT_STORE_TABLE_NAME,
          KeyConditionExpression: "begins_with(#key, :k)",
          ExpressionAttributeNames: { "#key": "key" },
          ExpressionAttributeValues: { ":k": keyPrefix },
        }),
      )
      .then((result) => result.Items as Fact[]);
  },
};

const createUpdateParams = (params: { [key: string]: unknown }) => ({
  UpdateExpression: `set ${Object.entries(params)
    .map(([key]) => `#${key} = :${key}, `)
    .reduce((acc, str) => acc + str, "")
    .slice(0, -2)}`,

  ExpressionAttributeValues: Object.entries(params).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`:${key}`]: value,
    }),
    {},
  ),

  ExpressionAttributeNames: Object.keys(params).reduce(
    (acc, key) => ({
      ...acc,
      [`#${key}`]: key,
    }),
    {},
  ),
});

export const createTable = async () => {
  return await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: FACT_STORE_TABLE_NAME,

      AttributeDefinitions: [
        {
          AttributeName: "KEY",
          AttributeType: "S",
        },
        {
          AttributeName: "TIMESTAMP",
          AttributeType: "N",
        },
      ],
      KeySchema: [
        {
          AttributeName: "KEY",
          KeyType: "HASH",
        },
        {
          AttributeName: "TIMESTAMP",
          KeyType: "RANGE",
        },
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

export default FactDatabaseClient;
