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
import {
  isFactEntity,
  type FactAdapter,
} from "../../factService/types";

const FACT_STORE_TABLE_NAME = process.env["FACT_TABLE_NAME"] ?? "fact_store";

const dynamoDbClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: dynamoDbUrl!,
});

const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

// logger.debug("DynamoAdapter %o", {
//   url: dynamoDbUrl,
//   table: FACT_STORE_TABLE_NAME,
// });
export const adapter: FactAdapter = {
  _name: "dynamo",

  async set({key, value, ...rest}) {
    const existing = await adapter.get({ key: key }).catch(() => null);
    if (existing) {
      logger.debug("Dynamo.exists(%o).update_mode", existing);
      // @ts-expect-error
      rest.TIMESTAMP = existing["TIMESTAMP"] ?? Date.now();
      // @ts-expect-error
      rest.created_at = existing.created_at;
    }
    const Item = {
      KEY: key,
      key,
      value,
      TIMESTAMP: 'TIMESTAMP' in rest ? rest['TIMESTAMP'] : Date.now(),
      created_at: 'created_at' in rest ? rest['created_at'] : new Date().toISOString(),
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
        if (isFactEntity(Item)) return Item;
        logger.error({ message: "Invalid fact" }, "Dynamo.set");
        throw new Error("Invalid fact");
      })
      .catch(autoSetup);
  },

  async get({ key }) {
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
        const item = result.Items?.[0];
        if (isFactEntity(item)) return item;
        logger.error({
          message: "Invalid fact",
        }, "Dynamo.get");
        return Promise.reject(new Error(`Invalid fact: ${key}`));
      });
  },

  async del({ key }) {
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

  async find({ keyPrefix }) {
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
      .then((result) => {
        const items = result.Items ?? [];
        const validResults = items.filter(isFactEntity);
        const validKeysFound = validResults.length;
        const totalKeysFound = items.length;

        logger.debug(
          {
            keyPrefix,
            validKeysFound,
            totalKeysFound,
          },
          "Dynamo",
        );
        if (totalKeysFound > validKeysFound)
          throw Error(
            `Error[${this._name}]: Invalid fact(s) found: ${
              totalKeysFound - validKeysFound
            }`,
          );
        return validResults;
      });
  },
};

/**
 * Temp helper to create a table in DynamoDB */
export const setup = async () => {
  return await dynamoDbClient
    .send(
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
    )
    .catch((error) => {
      if (error.message.includes("already exists")) {
        return "Already exists";
      }
      throw error;
    });
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
        Promise.reject(UserError("Table not found! Retry your request.")),
      );
  }
  throw error;
}
