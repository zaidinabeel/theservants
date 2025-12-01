/**
 * ============================================
 * DATABASE CONNECTION UTILITY
 * ============================================
 * Manages MongoDB connection with singleton pattern
 * to prevent multiple connections in development
 */

import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URL) {
  throw new Error('Please add your MONGO_URL to .env');
}

const uri = process.env.MONGO_URL;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('theservants');
}

/**
 * Get collection with type safety
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>} MongoDB collection
 */
export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
