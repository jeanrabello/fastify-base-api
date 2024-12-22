import { fastify, FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const app: FastifyInstance = fastify().withTypeProvider<ZodTypeProvider>();

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default app;
