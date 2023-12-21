import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { checkDuplicateKeyError } from "../../common/routeUtils";
import type { Fact, FactAdapter } from "../factService/types";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const FactDatabaseClient: FactAdapter = {
  create: async (fact) =>
    docClient.send<Fact, Fact[]>(new PutCommand({
      TableName: "fact_store",
      Item: fact,
      ReturnValues: "ALL_OLD"
    })),

  updateById: async ({ id, ...fact }) =>
    docClient.send<Fact, Fact>(new UpdateCommand({
      TableName: "fact_store",
      Key: { id },
      UpdateExpression: {
        
      },
      ExpressionAttributeValues: /* values */,
      ReturnValues: "ALL_NEW"
    })).then((result) => [result]),

  updateByPathKey: async (update, fact) => {
    // This operation may need to be adjusted based on your DynamoDB schema
    try {
      const params = {
        TableName: "fact_store",
        Key: { path: update.path, key: update.key },
        UpdateExpression: "set #fact = :f",
        ExpressionAttributeNames: { "#fact": "fact" },
        ExpressionAttributeValues: { ":f": fact },
        ReturnValues: "UPDATED_NEW",
      };
      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      return handleDynamoDbError(error, fact);
    }
  },

  removeById: async (id) => {
    try {
      const params = {
        TableName: "fact_store",
        Key: { id },
        ReturnValues: "ALL_OLD",
      };
      const result = await dynamoDb.delete(params).promise();
      return {
        success: !!result.Attributes,
        message: `Deleted fact with id: ${id}`,
      };
    } catch (error) {
      console.error("ERROR", error);
      // Error handling
    }
  },

  // ... [other methods like getPathCounts and findFactsByPathKeys]

  findAllFactsByPath: async ({ path, limit }) => {
    try {
      const params = {
        TableName: "fact_store",
        Limit: limit ?? 250,
        KeyConditionExpression: "path = :p",
        ExpressionAttributeValues: { ":p": path },
      };
      const result = await dynamoDb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error("ERROR", error);
      // Error handling
    }
  },
};

function handleDynamoDbError(error, fact) {
  // Implement specific DynamoDB error handling logic
  console.error("DynamoDB error", error);
  // Return or throw an appropriate error response
}

export const createUpdateParams = (params: { [key: string]: unknown }) => ({
  UpdateExpression: `set ${Object.entries(params)
    .map(([key]) => `#${key} = :${key}, `)
    .reduce((acc, str) => acc + str, '')
    .slice(0, -2)}`,

  ExpressionAttributeNames: Object.keys(params).reduce(
    (acc, key) => ({
      ...acc,
      [`#${key}`]: key,
    }),
    {}
  ),

  ExpressionAttributeValues: Object.entries(params).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`:${key}`]: value,
    }),
    {}
  ),
})


export default FactDatabaseClient;
