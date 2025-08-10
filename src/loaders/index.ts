import { connectToMongoDatabase } from "./mongoDatabase";

export const initializeLoaders = async () => {
  await connectToMongoDatabase();
};
