import type { Fact, FactAdapter } from "../../factService/types";
import { Firestore } from "@google-cloud/firestore";
import { logger } from "../../../common/logger";
import { isArray } from "lodash";

const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
});

firestore.settings({
  host: process.env.FIRESTORE_HOST,
  ssl: false,
  ignoreUndefinedProperties: true,
});

const COLLECTION_NAME = "fact_store";

export const adapter: FactAdapter = {
  _name: "firestore",

  set: async ({ key, fact }) => {
    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(key);
      await docRef.set(fact);
      return { key, ...fact };
    } catch (error) {
      logger.error("ERROR %o", error);
      throw error;
    }
  },

  get: async ({ key }) => {
    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(key);
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error("Document not found");
      }
      return { key, ...doc.data() }; // Adjust as needed
    } catch (error) {
      logger.error("ERROR %o", error);
      throw error;
    }
  },

  del: async ({ key }) => {
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

  find: async ({ keyPrefix }) => {
    try {
      const querySnapshot = await firestore
        .collection(COLLECTION_NAME)
        .where("key", ">=", keyPrefix)
        .where("key", "<", keyPrefix + "\uf8ff")
        .get();

      return querySnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      })) as Fact[]; // Adjust as needed
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
