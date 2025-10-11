import { MongoClient, Db } from "mongodb";
import config from "@config/api";

let db: Db;

const connectToMongoDatabase = async () => {
  const { uri, dbName, user, password, host } = config.db;

  // If 'uri' is provided, it takes precedence and other connection parameters (user, password, host) are ignored.
  const connectionUri =
    uri ||
    `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:27017/?authSource=admin`;

  const client = new MongoClient(connectionUri);
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
