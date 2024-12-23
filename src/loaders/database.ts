import { MongoClient, Db } from "mongodb";
import config from "@config/api";

let db: Db;

const connectToDatabase = async () => {
  const { dbName, uri } = config.db;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error("Error connecting with MongoDB:", error);
    process.exit(1);
  }
};

const getDb = (): Db => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

export { connectToDatabase, getDb };
