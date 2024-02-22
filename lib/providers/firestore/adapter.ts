import { isFactEntity, type FactAdapter } from "../../factService/types";
import { Firestore } from "@google-cloud/firestore";
import { logger } from "../../../common/logger";
import { isArray } from "lodash";

const firestore = new Firestore({
  projectId: process.env["FIRESTORE_PROJECT_ID"],
});

firestore.settings({
  host: process.env["FIRESTORE_HOST"],
  ssl: false,
  ignoreUndefinedProperties: true,
});

const COLLECTION_NAME = "fact_store";

export const adapter: FactAdapter = {
  _name: "firestore",

  async set({ key, value }) {
    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(key);
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") throw new Error("Invalid primitive value");

      await docRef.set(value);
      return { key, value };
    } catch (error) {
      logger.error("ERROR %o", error);
      throw error;
    }
  },

  async get({ key }) {
    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(key);
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error("Document not found");
      }
      const result = { key, ...doc.data() }; // Adjust as needed
      if (isFactEntity(result)) return result;
      throw new Error("Invalid fact");
    } catch (error) {
      logger.error(`ERROR[${this._name}] %o`, error);
      throw error;
    }
  },

  async del({ key }) {
    try {
      let count = 0;
      key = isArray(key) ? key : [key];
      for await (const k of key) {
        await firestore.collection(COLLECTION_NAME).doc(k).delete();
        count++;
      }
      return {
        count,
        success: true,
        message: `Deleted ${count} fact(s) with id(s) ${key.join(", ")}`,
      };
    } catch (error) {
      logger.error("ERROR %o", error);
      throw error;
    }
  },

  async find({ keyPrefix }) {
    try {
      const querySnapshot = await firestore
        .collection(COLLECTION_NAME)
        .where("key", ">=", keyPrefix)
        .where("key", "<", keyPrefix + "\uf8ff")
        .get();

      const results = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));

      const validResults = results.filter(isFactEntity);

      const totalKeysFound = results.length;
      const validKeysFound = validResults.length;

      logger.debug("Found %d keys", validResults.length);
      logger.info(
        {
          query: keyPrefix,
          validKeysFound,
          totalKeysFound,
        },
        this._name,
      );
      if (totalKeysFound > validKeysFound)
        throw Error(`Invalid fact(s) found: ${totalKeysFound - validKeysFound}`);

      return validResults;
    } catch (error) {
      logger.error("ERROR %o", error);
      throw error;
    }
  },
};

export const reset = async () => {
  try {
    const collectionRef = firestore.collection(COLLECTION_NAME);
    const docs = await collectionRef.listDocuments();
    await Promise.all(docs.map((doc) => doc.delete()));
    return true;
  } catch (error) {
    logger.error("ERROR %o", error);
    throw error;
  }
};
