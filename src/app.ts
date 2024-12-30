import config from "@config/api";
import { fastifyCors } from "@fastify/cors";
import translationMiddleware from "@middlewares/translation";
import { routes } from "@modules/routes";
import { swaggerPlugin } from "@plugins/index";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { initializeLoaders } from "./loaders/index";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

swaggerPlugin(app);
translationMiddleware(app);

app.register(routes);

const startServer = async () => {
  try {
    await initializeLoaders();

    const address = await app.listen({ port: config.app.port });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    console.error("Failed to start application:", err);
    process.exit(1);
  }
};

startServer();

export default app;
