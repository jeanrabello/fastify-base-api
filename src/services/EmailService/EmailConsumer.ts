import { getRabbitMQChannel } from "@src/loaders/rabbitmq";
import { sendEmail } from "@utils/sendMail";

export const emailConsumer = async (queue: string): Promise<void> => {
  const channel = getRabbitMQChannel();

  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  channel.assertQueue(queue, { durable: true });

  try {
    channel.consume(
      queue,
      async (msg) => { 
        if (msg) {
          const message = JSON.parse(msg.content.toString());
          try {
            await sendEmail({
              to: message.email,
              subject: message.subject || "",
              content: message.content,
            });
            channel.ack(msg);
            console.log(`Message consumed`);
          } catch (error) {
            console.log(error);
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error(`Error configuring consumer for email queue`, error);
    throw error;
  }
};
