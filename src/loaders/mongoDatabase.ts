import { MongoClient, Db } from "mongodb";
import config from "@config/api";

let db: Db;

const connectToMongoDatabase = async () => {
  const { dbName, uri } = config.db;

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log(`Connected to MongoDB: ${dbName}`);
};

const getMongoDb = (): Db => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

export { connectToMongoDatabase, getMongoDb };
