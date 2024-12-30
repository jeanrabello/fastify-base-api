import { connectToDatabase } from "./database";

export const initializeLoaders = async () => {
  await connectToDatabase();
};
