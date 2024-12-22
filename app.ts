import config from "@config/api";
import translationMiddleware from "@middlewares/translation";
import { fastify, FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const app: FastifyInstance = fastify().withTypeProvider<ZodTypeProvider>();

translationMiddleware(app);

app.get("/", async (request, reply) => {
  return reply.send({
    message: request.languagePack.commom.helloWorld,
  });
});

app.listen({ port: config.app.port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default app;
