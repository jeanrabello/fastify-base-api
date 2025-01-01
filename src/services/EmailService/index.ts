import { connectToRabbitMQ } from "@src/loaders/rabbitmq";
import { emailConsumer } from "./EmailConsumer";

const startQueueConsumer = async (): Promise<void> => {
  const queueName = "email";
  await emailConsumer(queueName);
};

const startQueueWorker = async () => {
  try {
    console.log("Starting consumer service...");
    await connectToRabbitMQ();
    await startQueueConsumer();
  } catch (error) {
    console.error("Error starting consumer service:", error);
    process.exit(1);
  }
};

startQueueWorker();
