import type { Fact, FactAdapter } from "../../factService/types";
import { Client } from 'cassandra-driver';
import { logger } from "../../../common/logger";
import { cassandraUrl } from '../../config';

const KEY_SPACE = 'fact_space';
const TABLE_NAME = 'fact_store';

const client = new Client({
  contactPoints: [cassandraUrl ?? 'localhost'],
  localDataCenter: 'datacenter1',
  keyspace: KEY_SPACE,
});

export const CassandraAdapter: FactAdapter = {
  set: async ({key, fact}) => {
    const query = 'INSERT INTO fact_store (key, fact) VALUES (?, ?) USING TIMESTAMP ?';
    const params = [key, fact, Date.now()];
    try {
      const result = await client.execute(query, params, { prepare: true });
      return result.rows[0]; // Adjust based on your data model and requirements
    } catch (error) {
      logger.error("ERROR", error);
      throw error; // Or handle the error as needed
    }
  },

  get: async ({ key }) => {
    const query = 'SELECT * FROM fact_store WHERE key = ?';
    try {
      const result = await client.execute(query, [key], { prepare: true });
      return result.rows[0]; // Adjust as needed
    } catch (error) {
      logger.error("ERROR", error);
      throw error;
    }
  },

  del: async ({ key }) => {
    const query = 'DELETE FROM fact_store WHERE key = ?';
    try {
      const result = await client.execute(query, [key], { prepare: true });
      return { success: result.rowLength > 0, count: result.rowLength, message: `Deleted any fact with an id equal to ${key}` };
    } catch (error) {
      logger.error("ERROR", error);
      throw error;
    }
  },

  find: async ({ keyPrefix }) => {
    // Note: Cassandra does not support ILIKE, so this is a basic implementation
    const query = 'SELECT * FROM fact_store WHERE key LIKE ?';
    try {
      const result = await client.execute(query, [`${keyPrefix}%`], { prepare: true });
      return result.rows as Fact[]; // Adjust as needed
    } catch (error) {
      logger.error("ERROR", error);
      throw error;
    }
  },
};

export const setupCassandra = async () => {
  const cql = `CREATE KEYSPACE IF NOT EXISTS ${KEY_SPACE}
    WITH REPLICATION = {
      'class' : 'SimpleStrategy',
      'replication_factor' : '1'
    };

  -- Create a table
  CREATE TABLE IF NOT EXISTS ${KEY_SPACE}.${TABLE_NAME} (
    key text PRIMARY KEY,
    fact map<text, text>,
    created_at timestamp,
    updated_at timestamp
  );`

  await client.execute(cql);
}

export const resetCassandra = async () => {
  await client.execute(`
    DROP KEYSPACE IF EXISTS ${KEY_SPACE};
    DROP TABLE IF EXISTS ${KEY_SPACE}.${TABLE_NAME};
  `);
}