import { connectToDatabase } from "./database";
import { connectToRabbitMQ } from "./rabbitmq";

export const initializeLoaders = async () => {
  await connectToDatabase();
  await connectToRabbitMQ();
};
