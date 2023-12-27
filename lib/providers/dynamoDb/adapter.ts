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
import { NotFoundError, UserError } from "../../factService/errors";
import type { Fact, FactAdapter } from "../../factService/types";

const FACT_STORE_TABLE_NAME = process.env.FACT_TABLE_NAME ?? "fact_store";

const dynamoDbClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: dynamoDbUrl,

  // credentials: {
  //   accessKeyId: "fake",
  //   secretAccessKey: "fake",
  // },
});

const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

logger.debug("DynamoAdapter %o", {
  url: dynamoDbUrl,
  table: FACT_STORE_TABLE_NAME,
});
export const adapter: FactAdapter = {
  _name: "dynamo",

  set: async (fact) => {
    const { key, fact: payload } = fact;
    const existing = await adapter.get({ key: fact.key }).catch(() => null);
    if (existing) {
      logger.debug("Dynamo.exists(%o).update_mode", existing);
      payload.TIMESTAMP = existing.TIMESTAMP ?? Date.now();
      payload.created_at = existing.created_at;
    }
    const Item = {
      ...payload,
      KEY: key,
      TIMESTAMP: payload.TIMESTAMP ?? Date.now(),
      created_at: payload.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    logger.debug("Dynamo.set(%o)", Item);
    return docClient
      .send(
        new PutCommand({
          TableName: FACT_STORE_TABLE_NAME,
          ReturnValues: "ALL_OLD",
          Item,
        }),
      )
      .then((result) => {
        logger.debug("PutCommand: %o", result);
        return Item;
      })
      .catch(autoSetup);
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
      .then((result) => {
        if (result.Items && result.Items?.length <= 0)
          return Promise.reject(new NotFoundError(`Fact not found: ${key}`));
        return result.Items?.[0] as Fact;
      });
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
        logger.debug("DeleteCommand: %s", key);
        return {
          success: !!result.Attributes,
          count: 1,
          message: `Deleted key matching ${key}`,
        };
      });
  },

  find: async ({ keyPrefix }) => {
    logger.debug("Dynamo.find(%o)", keyPrefix);
    return docClient
      .send(
        new ScanCommand({
          TableName: FACT_STORE_TABLE_NAME,
          FilterExpression: "begins_with(#k, :k)",
          ExpressionAttributeNames: { "#k": "KEY" },
          ExpressionAttributeValues: { ":k": keyPrefix },
        }),
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

/**
 * Temp helper to create a table in DynamoDB */
export const setup = async () => {
  return await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: FACT_STORE_TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: "KEY",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "KEY",
          KeyType: "HASH",
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

export const reset = async () => {
  return await dynamoDbClient.send(
    new DeleteTableCommand({
      TableName: FACT_STORE_TABLE_NAME,
    }),
  );
};

function autoSetup<TError extends Error>(error: TError) {
  if ("code" in error && error?.code === "ResourceNotFoundException") {
    return setup()
      .catch((error) => logger.error("ERROR %o", error))
      .then(() =>
        Promise.reject(new UserError("Table not found! Retry your request.")),
      );
  }
  throw error;
}
