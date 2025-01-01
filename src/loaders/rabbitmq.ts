import config from "@config/api";
import amqp, { Channel } from "amqplib";

let channel: Channel | null = null;

const connectToRabbitMQ = async (): Promise<void> => {
  if (channel) return;
  const connection = await amqp.connect(config.rabbitmq.uri);
  console.log(`Connected to RabbitMQ`);
  channel = await connection.createChannel();
};

const getRabbitMQChannel = (): Channel | null => channel;

export { connectToRabbitMQ, getRabbitMQChannel };
