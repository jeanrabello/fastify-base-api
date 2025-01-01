import { getRabbitMQChannel } from "@src/loaders/rabbitmq";

export const publishToQueue = (queue: string, message: unknown) => {
  const channel = getRabbitMQChannel();

  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Message sent to queue: ${queue}`);
};
